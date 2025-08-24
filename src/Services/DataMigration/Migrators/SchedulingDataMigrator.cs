using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SchedulingContext = KDVManager.Services.Scheduling.Infrastructure.ApplicationDbContext;
using Schedule = KDVManager.Services.Scheduling.Domain.Entities.Schedule;
using ScheduleRule = KDVManager.Services.Scheduling.Domain.Entities.ScheduleRule;
using TimeSlot = KDVManager.Services.Scheduling.Domain.Entities.TimeSlot;
using Group = KDVManager.Services.Scheduling.Domain.Entities.Group;
using CRMContext = KDVManager.Services.CRM.Infrastructure.ApplicationDbContext;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.DataMigration.Migrators;

public class SchedulingDataMigrator
{
    private readonly SchedulingContext _context;
    private readonly CRMContext _crmContext; // Add CRM context
    private readonly IConfiguration _configuration;
    private readonly ITenancyContextAccessor _tenancyContextAccessor; // Add tenancy context
    private readonly Services.NameAnonymizer _anonymizer;
    private readonly bool _anonymize;

    public SchedulingDataMigrator(SchedulingContext context, CRMContext crmContext, IConfiguration configuration, ITenancyContextAccessor tenancyContextAccessor, Services.NameAnonymizer anonymizer)
    {
        _context = context;
        _crmContext = crmContext; // Initialize CRM context
        _configuration = configuration;
        _tenancyContextAccessor = tenancyContextAccessor; // Initialize tenancy context
        _anonymizer = anonymizer;
        _anonymize = bool.TryParse(configuration["DataMigration:Anonymize"], out var anon) && anon;
    }

    public async Task MigrateAsync(Dictionary<int, Guid> childIdMapping)
    {
        // Clear all data for the tenant before migration
        await ClearTenantDataAsync();

        // Insert children into Scheduling service
        await InsertChildrenIntoSchedulingServiceAsync();

        // First, create TimeSlots for unique begin_time and end_time combinations
        var timeSlotMapping = await MigrateTimeSlotsAsync();

        // Then create Groups for unique group IDs
        var groupMapping = await MigrateGroupsAsync();

        // Finally, migrate Schedules and ScheduleRules together
        await MigrateSchedulesAsync(childIdMapping, timeSlotMapping, groupMapping);
        // Create automatic EndMarks (child turns 4 minus 1 day)
        await CreateEndMarksForChildrenAsync();
        // Recalculate schedule end dates now that EndMarks exist
        await RecalculateScheduleEndDatesAsync();

        // Create closure dates
        await CreateClosureDatesAsync();
    }

    private async Task ClearTenantDataAsync()
    {
        Console.WriteLine("Clearing all data for the tenant...");

        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"ScheduleRules\" WHERE \"TenantId\" = {0};", _tenancyContextAccessor.Current.TenantId);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Schedules\" WHERE \"TenantId\" = {0};", _tenancyContextAccessor.Current.TenantId);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Groups\" WHERE \"TenantId\" = {0};", _tenancyContextAccessor.Current.TenantId);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"TimeSlots\" WHERE \"TenantId\" = {0};", _tenancyContextAccessor.Current.TenantId);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Children\" WHERE \"TenantId\" = {0};", _tenancyContextAccessor.Current.TenantId);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"ClosurePeriods\" WHERE \"TenantId\" = {0};", _tenancyContextAccessor.Current.TenantId);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"EndMarks\" WHERE \"TenantId\" = {0};", _tenancyContextAccessor.Current.TenantId);

        Console.WriteLine("All data for the tenant has been cleared.");
    }

    private async Task<Dictionary<string, Guid>> MigrateTimeSlotsAsync()
    {
        Console.WriteLine("Migrating TimeSlots...");

        var mssqlConnectionString = _configuration.GetConnectionString("MSSQLSourceConnectionString");
        var timeSlotMapping = new Dictionary<string, Guid>();

        var query = @"
            SELECT DISTINCT 
                CAST(begintime AS TIME) AS BeginTime,
                CAST(endtime AS TIME) AS EndTime
            FROM SchedulingRule
            WHERE begintime IS NOT NULL AND endtime IS NOT NULL
            ORDER BY BeginTime, EndTime;
        ";

        using var connection = new SqlConnection(mssqlConnectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        var migratedCount = 0;
        while (await reader.ReadAsync())
        {
            var beginTime = TimeOnly.FromTimeSpan((TimeSpan)reader["BeginTime"]);
            var endTime = TimeOnly.FromTimeSpan((TimeSpan)reader["EndTime"]);
            var key = $"{beginTime}-{endTime}";

            // Determine the specific time slot name based on the times
            string timeSlotName;
            if (beginTime == new TimeOnly(8, 0) && endTime == new TimeOnly(13, 0))
            {
                timeSlotName = "Ochtend";
                beginTime = TimeOnly.FromTimeSpan(new TimeSpan(8, 30, 0));
                Console.WriteLine($"Creating time slot: {timeSlotName} (08:00-13:00)");
            }
            else if (beginTime == new TimeOnly(8, 0) && endTime == new TimeOnly(18, 0))
            {
                timeSlotName = "Hele dag";
                beginTime = TimeOnly.FromTimeSpan(new TimeSpan(8, 30, 0));
                Console.WriteLine($"Creating time slot: {timeSlotName} (08:00-18:00)");
            }
            else if (beginTime == new TimeOnly(13, 0) && endTime == new TimeOnly(18, 0))
            {
                timeSlotName = "Middag";
                Console.WriteLine($"Creating time slot: {timeSlotName} (13:00-18:00)");
            }
            else
            {
                // Fallback to the default format for any other time combinations
                timeSlotName = $"{beginTime:HH:mm} - {endTime:HH:mm}";
                Console.WriteLine($"Creating time slot: {timeSlotName} (custom time range)");
            }

            var timeSlot = new TimeSlot
            {
                Id = Guid.NewGuid(),
                Name = timeSlotName,
                StartTime = beginTime,
                EndTime = endTime,
                TenantId = _tenancyContextAccessor.Current.TenantId
            };

            _context.TimeSlots.Add(timeSlot);
            timeSlotMapping[key] = timeSlot.Id;
            migratedCount++;
        }

        await _context.SaveChangesAsync();
        Console.WriteLine($"TimeSlots migration completed: {migratedCount} time slots migrated");

        return timeSlotMapping;
    }

    private async Task<Dictionary<int, Guid>> MigrateGroupsAsync()
    {
        Console.WriteLine("Migrating Groups...");

        var mssqlConnectionString = _configuration.GetConnectionString("MSSQLSourceConnectionString");
        var groupMapping = new Dictionary<int, Guid>();

        var query = @"
            SELECT DISTINCT [group] AS GroupId
            FROM SchedulingRule
            WHERE [group] IS NOT NULL
            ORDER BY [group];
        ";

        using var connection = new SqlConnection(mssqlConnectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        var migratedCount = 0;
        while (await reader.ReadAsync())
        {
            var groupId = Convert.ToInt32(reader["GroupId"]);

            var group = new Group
            {
                Id = Guid.NewGuid(),
                Name = $"Groep {groupId}",
                TenantId = _tenancyContextAccessor.Current.TenantId
            };

            _context.Groups.Add(group);
            groupMapping[groupId] = group.Id;
            migratedCount++;
        }

        await _context.SaveChangesAsync();
        Console.WriteLine($"Groups migration completed: {migratedCount} groups migrated");

        return groupMapping;
    }

    private async Task MigrateSchedulesAsync(Dictionary<int, Guid> childIdMapping, Dictionary<string, Guid> timeSlotMapping, Dictionary<int, Guid> groupMapping)
    {
        var mssqlConnectionString = _configuration.GetConnectionString("MSSQLSourceConnectionString");

        if (string.IsNullOrEmpty(mssqlConnectionString))
        {
            throw new InvalidOperationException("MSSQLSourceConnectionString not found in configuration");
        }

        var query = @"
            WITH ScheduleWithGroup AS (
            SELECT
                s.Id AS SchedulingId,
                s.ChildId,
                s.[Date] AS StartDate,
                sr.Id AS ScheduleRuleId,
                sr.[group] AS GroupId,
                sr.day,
                CAST(sr.begintime AS TIME) AS BeginTime,
                CAST(sr.endtime AS TIME) AS EndTime
            FROM
                Scheduling s
            JOIN
                SchedulingRule sr ON s.Id = sr.SchedulingId
            WHERE sr.begintime IS NOT NULL 
                AND sr.endtime IS NOT NULL 
                AND sr.[group] IS NOT NULL
                AND sr.day IS NOT NULL
            ),
            OrderedSchedules AS (
            SELECT
                *,
                ROW_NUMBER() OVER (PARTITION BY ChildId ORDER BY StartDate, SchedulingId) AS RowNum
            FROM ScheduleWithGroup
            ),
            SchedulingWithPotentialNext AS (
            SELECT
                curr.SchedulingId,
                curr.ChildId,
                curr.StartDate,
                curr.ScheduleRuleId,
                curr.GroupId,
                curr.day,
                curr.BeginTime,
                curr.EndTime,
                next.StartDate AS PotentialEndDate
            FROM
                OrderedSchedules curr
            LEFT JOIN OrderedSchedules next
                ON curr.ChildId = next.ChildId
                AND next.RowNum > curr.RowNum
                AND next.SchedulingId != curr.SchedulingId
            ),
            NextEndDates AS (
            SELECT
                SchedulingId,
                ChildId,
                StartDate,
                ScheduleRuleId,
                GroupId,
                day,
                BeginTime,
                EndTime,
                MIN(DATEADD(DAY, -1, PotentialEndDate)) AS EndDate
            FROM SchedulingWithPotentialNext
            GROUP BY SchedulingId, ChildId, StartDate, ScheduleRuleId, GroupId, day, BeginTime, EndTime
            ),
            FinalWithFallback AS (
            SELECT
                nd.SchedulingId,
                nd.ChildId,
                nd.StartDate,
                nd.ScheduleRuleId,
                nd.GroupId,
                nd.day,
                nd.BeginTime,
                nd.EndTime,
                ISNULL(nd.EndDate, DATEADD(DAY, -1, DATEADD(YEAR, 4, c.dateofbirth))) AS EndDate
            FROM
                NextEndDates nd
            JOIN
                Person c ON c.Id = nd.ChildId
            )
            SELECT *
            FROM FinalWithFallback
            ORDER BY ChildId, StartDate, ScheduleRuleId;
        ";

        using var connection = new SqlConnection(mssqlConnectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        var migratedScheduleCount = 0;
        var migratedRuleCount = 0;
        var skippedCount = 0;
        var currentScheduleId = Guid.Empty;
        var scheduleMapping = new Dictionary<int, Guid>(); // Maps external scheduling ID to internal schedule ID

        // Build a lookup for child names from CRM context
        var crmChildNames = _crmContext.Children.ToDictionary(c => c.Id, c => new { c.GivenName, c.FamilyName });

        Console.WriteLine("Reading scheduling data with rules from MSSQL...");

        while (await reader.ReadAsync())
        {
            try
            {
                var externalSchedulingId = Convert.ToInt32(reader["SchedulingId"]);
                var externalChildId = Convert.ToInt32(reader["ChildId"]);
                var startDate = Convert.ToDateTime(reader["StartDate"]);
                var endDate = reader["EndDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(reader["EndDate"]);

                var externalGroupId = Convert.ToInt32(reader["GroupId"]);
                var day = Convert.ToInt32(reader["day"]);
                var beginTime = TimeOnly.FromTimeSpan((TimeSpan)reader["BeginTime"]);
                var endTime = TimeOnly.FromTimeSpan((TimeSpan)reader["EndTime"]);

                // Map external child ID to internal child ID
                if (!childIdMapping.ContainsKey(externalChildId))
                {
                    Console.WriteLine($"Warning: External child ID {externalChildId} not found in mapping. Skipping.");
                    skippedCount++;
                    continue;
                }

                var childId = childIdMapping[externalChildId];

                // Ensure child in Scheduling DB has correct names (if not already set)
                var schedChild = await _context.Children.FirstOrDefaultAsync(c => c.Id == childId);
                if (schedChild != null && crmChildNames.TryGetValue(childId, out var crmNames))
                {
                    string? given = crmNames.GivenName;
                    string? family = crmNames.FamilyName;
                    if (_anonymize)
                    {
                        (given, family) = _anonymizer.Anonymize(given, family);
                    }
                    if (string.IsNullOrWhiteSpace(schedChild.GivenName) && !string.IsNullOrWhiteSpace(given))
                        schedChild.GivenName = given;
                    if (string.IsNullOrWhiteSpace(schedChild.FamilyName) && !string.IsNullOrWhiteSpace(family))
                        schedChild.FamilyName = family;
                }

                // Check if we need to create a new schedule or if we're adding rules to an existing one
                if (!scheduleMapping.ContainsKey(externalSchedulingId))
                {
                    // Create new schedule
                    var scheduleId = Guid.NewGuid();

                    var schedule = new Schedule
                    {
                        Id = scheduleId,
                        ChildId = childId,
                        StartDate = DateOnly.FromDateTime(startDate),
                        // EndDate is calculated later via timeline logic; do not set here
                        TenantId = _tenancyContextAccessor.Current.TenantId
                    };

                    _context.Schedules.Add(schedule);
                    scheduleMapping[externalSchedulingId] = scheduleId;
                    currentScheduleId = scheduleId;
                    migratedScheduleCount++;
                }
                else
                {
                    currentScheduleId = scheduleMapping[externalSchedulingId];
                }

                // Create schedule rule
                if (!groupMapping.ContainsKey(externalGroupId))
                {
                    Console.WriteLine($"Warning: External group ID {externalGroupId} not found in mapping. Skipping rule.");
                    skippedCount++;
                    continue;
                }

                var timeSlotKey = $"{beginTime}-{endTime}";
                if (!timeSlotMapping.ContainsKey(timeSlotKey))
                {
                    Console.WriteLine($"Warning: Time slot {timeSlotKey} not found in mapping. Skipping rule.");
                    skippedCount++;
                    continue;
                }

                var groupId = groupMapping[externalGroupId];
                var timeSlotId = timeSlotMapping[timeSlotKey];

                // Convert day from integer to DayOfWeek 
                DayOfWeek dayOfWeek;
                switch (day)
                {
                    case 0: dayOfWeek = DayOfWeek.Sunday; break;
                    case 1: dayOfWeek = DayOfWeek.Monday; break;
                    case 2: dayOfWeek = DayOfWeek.Tuesday; break;
                    case 3: dayOfWeek = DayOfWeek.Wednesday; break;
                    case 4: dayOfWeek = DayOfWeek.Thursday; break;
                    case 5: dayOfWeek = DayOfWeek.Friday; break;
                    case 6: dayOfWeek = DayOfWeek.Saturday; break;
                    default:
                        Console.WriteLine($"Warning: Invalid day value {day}. Skipping rule.");
                        skippedCount++;
                        continue;
                }

                var scheduleRule = new ScheduleRule
                {
                    Id = Guid.NewGuid(),
                    ScheduleId = currentScheduleId,
                    GroupId = groupId,
                    TimeSlotId = timeSlotId,
                    Day = dayOfWeek,
                    TenantId = _tenancyContextAccessor.Current.TenantId
                };

                _context.ScheduleRules.Add(scheduleRule);
                migratedRuleCount++;

                // Batch save every 100 records
                if ((migratedScheduleCount + migratedRuleCount) % 100 == 0)
                {
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Migrated {migratedScheduleCount} schedules and {migratedRuleCount} rules...");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing record: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                skippedCount++;
            }
        }

        // Save any remaining records
        if (_context.ChangeTracker.HasChanges())
        {
            await _context.SaveChangesAsync();
        }

        Console.WriteLine($"Scheduling migration completed: {migratedScheduleCount} schedules and {migratedRuleCount} schedule rules migrated, {skippedCount} skipped");
    }

    private async Task InsertChildrenIntoSchedulingServiceAsync()
    {
        Console.WriteLine("Inserting children into Scheduling service...");

        // Retrieve all children from the CRM service
        var crmChildren = await _crmContext.Children
            .Select(c => new { c.Id, c.DateOfBirth })
            .ToListAsync();

        foreach (var child in crmChildren)
        {
            if (child.Id == Guid.Empty || child.DateOfBirth == null)
            {
                Console.WriteLine($"Skipping invalid child data: Id={child.Id}, DateOfBirth={child.DateOfBirth}");
                continue;
            }

            var schedulingChild = new KDVManager.Services.Scheduling.Domain.Entities.Child
            {
                Id = child.Id,
                DateOfBirth = child.DateOfBirth,
                TenantId = _tenancyContextAccessor.Current.TenantId
            };

            _context.Children.Add(schedulingChild);
        }

        try
        {
            await _context.SaveChangesAsync();
            Console.WriteLine("Children successfully inserted into Scheduling service.");
        }
        catch (DbUpdateException ex)
        {
            Console.WriteLine($"Error saving children: {ex.Message}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            throw;
        }
    }

    private async Task CreateClosureDatesAsync()
    {
        Console.WriteLine("Creating closure dates...");


        // Closure dates for 2025 (Nederlandse feestdagen) with reasons
        var closureDates = new List<KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod>
        {
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 1, 1),
                EndDate = new DateOnly(2025, 1, 1),
                Reason = "Nieuwjaarsdag",
                TenantId = _tenancyContextAccessor.Current.TenantId
            },
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 4, 18),
                EndDate = new DateOnly(2025, 4, 18),
                Reason = "Goede Vrijdag",
                TenantId = _tenancyContextAccessor.Current.TenantId
            },
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 4, 20),
                EndDate = new DateOnly(2025, 4, 20),
                Reason = "Eerste Paasdag",
                TenantId = _tenancyContextAccessor.Current.TenantId
            },
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 4, 21),
                EndDate = new DateOnly(2025, 4, 21),
                Reason = "Tweede Paasdag",
                TenantId = _tenancyContextAccessor.Current.TenantId
            },
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 4, 26),
                EndDate = new DateOnly(2025, 4, 26),
                Reason = "Koningsdag",
                TenantId = _tenancyContextAccessor.Current.TenantId
            },
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 5, 5),
                EndDate = new DateOnly(2025, 5, 5),
                Reason = "Bevrijdingsdag",
                TenantId = _tenancyContextAccessor.Current.TenantId
            },
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 5, 29),
                EndDate = new DateOnly(2025, 5, 29),
                Reason = "Hemelvaartsdag",
                TenantId = _tenancyContextAccessor.Current.TenantId
            },
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 6, 8),
                EndDate = new DateOnly(2025, 6, 8),
                Reason = "Eerste Pinksterdag",
                TenantId = _tenancyContextAccessor.Current.TenantId
            },
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 6, 9),
                EndDate = new DateOnly(2025, 6, 9),
                Reason = "Tweede Pinksterdag",
                TenantId = _tenancyContextAccessor.Current.TenantId
            },
            // Zomersluiting: 21 juli t/m 1 augustus 2025
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 7, 21),
                EndDate = new DateOnly(2025, 8, 1),
                Reason = "Zomersluiting",
                TenantId = _tenancyContextAccessor.Current.TenantId
            },
            // Wintersluiting: 25 december 2025 t/m 1 januari 2026
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 12, 25),
                EndDate = new DateOnly(2026, 1, 1),
                Reason = "Wintersluiting",
                TenantId = _tenancyContextAccessor.Current.TenantId
            },
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 12, 25),
                EndDate = new DateOnly(2025, 12, 25),
                Reason = "Eerste Kerstdag",
                TenantId = _tenancyContextAccessor.Current.TenantId
            },
            new KDVManager.Services.Scheduling.Domain.Entities.ClosurePeriod
            {
                Id = Guid.NewGuid(),
                StartDate = new DateOnly(2025, 12, 26),
                EndDate = new DateOnly(2025, 12, 26),
                Reason = "Tweede Kerstdag",
                TenantId = _tenancyContextAccessor.Current.TenantId
            }
        };

        foreach (var closurePeriod in closureDates)
        {
            _context.ClosurePeriods.Add(closurePeriod);
        }

        await _context.SaveChangesAsync();
        Console.WriteLine("Closure dates created successfully.");
    }

    private async Task CreateEndMarksForChildrenAsync()
    {
        Console.WriteLine("Creating automatic EndMarks (day before 4th birthday)...");

        var children = await _context.Children.AsNoTracking().Select(c => new { c.Id, c.DateOfBirth }).ToListAsync();
        int created = 0;
        foreach (var child in children)
        {
            var fourYearsDate = child.DateOfBirth.AddYears(4);
            var endMarkDate = fourYearsDate;
            // Skip if already exists (by ChildId + EndDate)
            bool exists = await _context.EndMarks.AnyAsync(em => em.ChildId == child.Id && em.EndDate == endMarkDate);
            if (exists) continue;
            var mark = new EndMark(child.Id, endMarkDate, "Automatisch einde: kind wordt 4");
            mark.TenantId = _tenancyContextAccessor.Current.TenantId;
            _context.EndMarks.Add(mark);
            created++;
        }
        if (created > 0)
        {
            await _context.SaveChangesAsync();
        }
        Console.WriteLine($"EndMarks creation completed: {created} created.");
    }

    private async Task RecalculateScheduleEndDatesAsync()
    {
        Console.WriteLine("Recalculating schedule EndDates based on EndMarks and sequence...");
        // Group schedules by child to minimize memory
        var childIds = await _context.Schedules.Select(s => s.ChildId).Distinct().ToListAsync();
        foreach (var childId in childIds)
        {
            var schedules = await _context.Schedules.Where(s => s.ChildId == childId).OrderBy(s => s.StartDate).ToListAsync();
            var marks = await _context.EndMarks.Where(e => e.ChildId == childId).ToListAsync();
            KDVManager.Services.Scheduling.Domain.Services.ScheduleEndDateCalculator.Recalculate(schedules, marks);
        }
        await _context.SaveChangesAsync();
        Console.WriteLine("Schedule EndDates recalculation complete.");
    }
}
