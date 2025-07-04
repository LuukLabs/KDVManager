using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SchedulingContext = KDVManager.Services.Scheduling.Infrastructure.ApplicationDbContext;
using Schedule = KDVManager.Services.Scheduling.Domain.Entities.Schedule;

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
}
