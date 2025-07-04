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

namespace KDVManager.Services.DataMigration.Migrators;

public class SchedulingDataMigrator
{
    private readonly SchedulingContext _context;
    private readonly IConfiguration _configuration;

    public SchedulingDataMigrator(SchedulingContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task MigrateAsync(Dictionary<int, Guid> childIdMapping)
    {
        // First, create TimeSlots for unique begin_time and end_time combinations
        var timeSlotMapping = await MigrateTimeSlotsAsync();

        // Then create Groups for unique group IDs
        var groupMapping = await MigrateGroupsAsync();

        // Then migrate Schedules
        await MigrateSchedulesAsync(childIdMapping);

        // Finally, migrate ScheduleRules
        await MigrateScheduleRulesAsync(childIdMapping, timeSlotMapping, groupMapping);
    }

    private async Task<Dictionary<string, Guid>> MigrateTimeSlotsAsync()
    {
        Console.WriteLine("Migrating TimeSlots...");

        // Truncate TimeSlots table
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"TimeSlots\" RESTART IDENTITY CASCADE;");

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

            var timeSlot = new TimeSlot
            {
                Id = Guid.NewGuid(),
                Name = $"{beginTime:HH:mm} - {endTime:HH:mm}",
                StartTime = beginTime,
                EndTime = endTime,
                TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f")
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

        // Truncate Groups table
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"Groups\" RESTART IDENTITY CASCADE;");

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
                Name = $"Group {groupId}",
                TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f")
            };

            _context.Groups.Add(group);
            groupMapping[groupId] = group.Id;
            migratedCount++;
        }

        await _context.SaveChangesAsync();
        Console.WriteLine($"Groups migration completed: {migratedCount} groups migrated");

        return groupMapping;
    }

    private async Task MigrateSchedulesAsync(Dictionary<int, Guid> childIdMapping)
    {
        // Truncate the Schedules table before importing
        Console.WriteLine("Truncating Schedules table...");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"Schedules\" RESTART IDENTITY CASCADE;");
        Console.WriteLine("Schedules table truncated.");

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
                    s.[Date] AS StartDate
                FROM
                    Scheduling s
                JOIN
                    SchedulingRule sr ON s.Id = sr.SchedulingId
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
                    MIN(PotentialEndDate) AS EndDate  -- eerstvolgende geldige afspraak
                FROM SchedulingWithPotentialNext
                GROUP BY SchedulingId, ChildId, StartDate
            ),
            FinalWithFallback AS (
                SELECT
                    nd.SchedulingId,
                    nd.ChildId,
                    nd.StartDate,
                    ISNULL(nd.EndDate, DATEADD(YEAR, 4, c.dateofbirth)) AS EndDate
                FROM
                    NextEndDates nd
                JOIN
                    Person c ON c.Id = nd.ChildId
            )
            SELECT *
            FROM FinalWithFallback
            ORDER BY ChildId, StartDate;
        ";

        using var connection = new SqlConnection(mssqlConnectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        var migratedCount = 0;
        var skippedCount = 0;

        Console.WriteLine("Reading scheduling data from MSSQL...");

        while (await reader.ReadAsync())
        {
            try
            {
                var externalChildId = Convert.ToInt32(reader["ChildId"]);
                var startDate = Convert.ToDateTime(reader["StartDate"]);
                var endDate = reader["EndDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(reader["EndDate"]);

                // Map external child ID to internal child ID
                if (!childIdMapping.ContainsKey(externalChildId))
                {
                    Console.WriteLine($"Warning: External child ID {externalChildId} not found in mapping. Skipping schedule.");
                    skippedCount++;
                    continue;
                }

                var childId = childIdMapping[externalChildId];

                var schedule = new Schedule
                {
                    Id = Guid.NewGuid(),
                    ChildId = childId,
                    StartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc),
                    EndDate = endDate.HasValue ? DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc) : null,
                    TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f")
                };

                _context.Schedules.Add(schedule);
                migratedCount++;

                // Batch save every 100 records
                if (migratedCount % 100 == 0)
                {
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Migrated {migratedCount} schedules...");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing schedule record: {ex.Message}");
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

        Console.WriteLine($"Scheduling migration completed: {migratedCount} schedules migrated, {skippedCount} skipped");
    }

    private async Task MigrateScheduleRulesAsync(Dictionary<int, Guid> childIdMapping, Dictionary<string, Guid> timeSlotMapping, Dictionary<int, Guid> groupMapping)
    {
        Console.WriteLine("Migrating ScheduleRules...");

        // Truncate ScheduleRules table
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"ScheduleRules\" RESTART IDENTITY CASCADE;");

        var mssqlConnectionString = _configuration.GetConnectionString("MSSQLSourceConnectionString");

        var query = @"
            SELECT 
                sr.Id,
                sr.SchedulingId,
                sr.[group] AS GroupId,
                sr.day,
                CAST(sr.begintime AS TIME) AS BeginTime,
                CAST(sr.endtime AS TIME) AS EndTime,
                s.ChildId
            FROM SchedulingRule sr
            INNER JOIN Scheduling s ON sr.SchedulingId = s.Id
            WHERE sr.begintime IS NOT NULL 
                AND sr.endtime IS NOT NULL 
                AND sr.[group] IS NOT NULL
                AND sr.day IS NOT NULL
            ORDER BY sr.SchedulingId, sr.day;
        ";

        using var connection = new SqlConnection(mssqlConnectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        var migratedCount = 0;
        var skippedCount = 0;

        // First, let's get all schedules and create a mapping from external scheduling ID to internal schedule ID
        var scheduleMapping = new Dictionary<int, Guid>();
        var schedules = await _context.Schedules.ToListAsync();

        // We need to create a mapping from external scheduling data to internal schedule IDs
        // This requires matching based on child ID and date ranges
        var externalScheduleQuery = @"
            SELECT DISTINCT
                s.Id AS SchedulingId,
                s.ChildId,
                s.[Date] AS StartDate
            FROM Scheduling s
            ORDER BY s.ChildId, s.[Date];
        ";

        using var scheduleConnection = new SqlConnection(mssqlConnectionString);
        await scheduleConnection.OpenAsync();
        using var scheduleCommand = new SqlCommand(externalScheduleQuery, scheduleConnection);
        using var scheduleReader = await scheduleCommand.ExecuteReaderAsync();

        while (await scheduleReader.ReadAsync())
        {
            var externalSchedulingId = Convert.ToInt32(scheduleReader["SchedulingId"]);
            var externalChildId = Convert.ToInt32(scheduleReader["ChildId"]);
            var startDate = Convert.ToDateTime(scheduleReader["StartDate"]);

            if (childIdMapping.ContainsKey(externalChildId))
            {
                var internalChildId = childIdMapping[externalChildId];
                var startDateUtc = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);

                // Find matching internal schedule
                var matchingSchedule = schedules.FirstOrDefault(s =>
                    s.ChildId == internalChildId &&
                    s.StartDate <= startDateUtc &&
                    (!s.EndDate.HasValue || s.EndDate >= startDateUtc));

                if (matchingSchedule != null)
                {
                    scheduleMapping[externalSchedulingId] = matchingSchedule.Id;
                }
            }
        }

        // Now process the schedule rules
        await connection.CloseAsync();
        await connection.OpenAsync();

        using var rulesCommand = new SqlCommand(query, connection);
        using var rulesReader = await rulesCommand.ExecuteReaderAsync();

        while (await rulesReader.ReadAsync())
        {
            try
            {
                var externalSchedulingId = Convert.ToInt32(rulesReader["SchedulingId"]);
                var externalGroupId = Convert.ToInt32(rulesReader["GroupId"]);
                var day = Convert.ToInt32(rulesReader["day"]);
                var beginTime = TimeOnly.FromTimeSpan((TimeSpan)rulesReader["BeginTime"]);
                var endTime = TimeOnly.FromTimeSpan((TimeSpan)rulesReader["EndTime"]);

                // Map to internal IDs
                if (!scheduleMapping.ContainsKey(externalSchedulingId))
                {
                    Console.WriteLine($"Warning: External scheduling ID {externalSchedulingId} not found in mapping. Skipping schedule rule.");
                    skippedCount++;
                    continue;
                }

                if (!groupMapping.ContainsKey(externalGroupId))
                {
                    Console.WriteLine($"Warning: External group ID {externalGroupId} not found in mapping. Skipping schedule rule.");
                    skippedCount++;
                    continue;
                }

                var timeSlotKey = $"{beginTime}-{endTime}";
                if (!timeSlotMapping.ContainsKey(timeSlotKey))
                {
                    Console.WriteLine($"Warning: Time slot {timeSlotKey} not found in mapping. Skipping schedule rule.");
                    skippedCount++;
                    continue;
                }

                var scheduleId = scheduleMapping[externalSchedulingId];
                var groupId = groupMapping[externalGroupId];
                var timeSlotId = timeSlotMapping[timeSlotKey];

                // Convert day from integer to DayOfWeek 
                // Source system appears to be shifted by one (1=Sunday, 2=Monday, etc.)
                DayOfWeek dayOfWeek;
                switch (day)
                {
                    case 1: dayOfWeek = DayOfWeek.Sunday; break;
                    case 2: dayOfWeek = DayOfWeek.Monday; break;
                    case 3: dayOfWeek = DayOfWeek.Tuesday; break;
                    case 4: dayOfWeek = DayOfWeek.Wednesday; break;
                    case 5: dayOfWeek = DayOfWeek.Thursday; break;
                    case 6: dayOfWeek = DayOfWeek.Friday; break;
                    case 7: dayOfWeek = DayOfWeek.Saturday; break;
                    default:
                        Console.WriteLine($"Warning: Invalid day value {day}. Skipping schedule rule.");
                        skippedCount++;
                        continue;
                }

                var scheduleRule = new ScheduleRule
                {
                    Id = Guid.NewGuid(),
                    ScheduleId = scheduleId,
                    GroupId = groupId,
                    TimeSlotId = timeSlotId,
                    Day = dayOfWeek,
                    TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f")
                };

                _context.ScheduleRules.Add(scheduleRule);
                migratedCount++;

                // Batch save every 100 records
                if (migratedCount % 100 == 0)
                {
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Migrated {migratedCount} schedule rules...");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing schedule rule record: {ex.Message}");
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

        Console.WriteLine($"ScheduleRules migration completed: {migratedCount} schedule rules migrated, {skippedCount} skipped");
    }
}
