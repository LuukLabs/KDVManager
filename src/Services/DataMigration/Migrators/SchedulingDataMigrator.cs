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

namespace KDVManager.Services.DataMigration.Migrators;

public class SchedulingDataMigrator
{
    private readonly SchedulingContext _context;
    private readonly CRMContext _crmContext; // Add CRM context
    private readonly IConfiguration _configuration;
    private readonly ITenancyContextAccessor _tenancyContextAccessor; // Add tenancy context

    public SchedulingDataMigrator(SchedulingContext context, CRMContext crmContext, IConfiguration configuration, ITenancyContextAccessor tenancyContextAccessor)
    {
        _context = context;
        _crmContext = crmContext; // Initialize CRM context
        _configuration = configuration;
        _tenancyContextAccessor = tenancyContextAccessor; // Initialize tenancy context
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
    }

    private async Task ClearTenantDataAsync()
    {
        Console.WriteLine("Clearing all data for the tenant...");

        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"ScheduleRules\" WHERE \"TenantId\" = {0};", _tenancyContextAccessor.Current.TenantId);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Schedules\" WHERE \"TenantId\" = {0};", _tenancyContextAccessor.Current.TenantId);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Groups\" WHERE \"TenantId\" = {0};", _tenancyContextAccessor.Current.TenantId);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"TimeSlots\" WHERE \"TenantId\" = {0};", _tenancyContextAccessor.Current.TenantId);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Children\" WHERE \"TenantId\" = {0};", _tenancyContextAccessor.Current.TenantId);

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
                    MIN(PotentialEndDate) AS EndDate
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
                    ISNULL(nd.EndDate, DATEADD(YEAR, 4, c.dateofbirth)) AS EndDate
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

                // Check if we need to create a new schedule or if we're adding rules to an existing one
                if (!scheduleMapping.ContainsKey(externalSchedulingId))
                {
                    // Create new schedule
                    var childId = childIdMapping[externalChildId];
                    var scheduleId = Guid.NewGuid();

                    var schedule = new Schedule
                    {
                        Id = scheduleId,
                        ChildId = childId,
                        StartDate = DateOnly.FromDateTime(startDate),
                        EndDate = endDate.HasValue ? DateOnly.FromDateTime(endDate.Value) : null,
                        TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f")
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
                    TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f")
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

        // Insert children into the Scheduling service
        foreach (var child in crmChildren)
        {
            var schedulingChild = new KDVManager.Services.Scheduling.Domain.Entities.Child
            {
                Id = child.Id,
                DateOfBirth = child.DateOfBirth,
                TenantId = _tenancyContextAccessor.Current.TenantId
            };

            _context.Children.Add(schedulingChild);
        }

        await _context.SaveChangesAsync();
        Console.WriteLine("Children successfully inserted into Scheduling service.");
    }
}
