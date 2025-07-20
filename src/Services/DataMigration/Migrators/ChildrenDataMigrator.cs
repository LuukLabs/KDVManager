using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Services.DataMigration.Utilities;
using CrmContext = KDVManager.Services.CRM.Infrastructure.ApplicationDbContext;
using Child = KDVManager.Services.CRM.Domain.Entities.Child;

namespace KDVManager.Services.DataMigration.Migrators;

public class ChildrenDataMigrator
{
    private readonly CrmContext _context;
    private readonly IConfiguration _configuration;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public ChildrenDataMigrator(CrmContext context, IConfiguration configuration, ITenancyContextAccessor tenancyContextAccessor)
    {
        _context = context;
        _configuration = configuration;
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    private async Task DeleteChildrenForTenantAsync(Guid tenantId)
    {
        Console.WriteLine($"Deleting children for tenant {tenantId}...");
        await _context.Database.ExecuteSqlRawAsync(
            "DELETE FROM \"Children\" WHERE \"TenantId\" = {0};",
            tenantId
        );
        Console.WriteLine($"Children for tenant {tenantId} deleted.");
    }

    public async Task<Dictionary<int, Guid>> MigrateAsync()
    {
        var childIdMapping = new Dictionary<int, Guid>();

        // Retrieve tenant ID from TenantService
        var tenantId = _tenancyContextAccessor.Current.TenantId;
        await DeleteChildrenForTenantAsync(tenantId);

        var mssqlConnectionString = _configuration.GetConnectionString("MSSQLSourceConnectionString");

        if (string.IsNullOrEmpty(mssqlConnectionString))
        {
            throw new InvalidOperationException("MSSQLSourceConnectionString not found in configuration");
        }

        var query = @"
            SELECT firstname, lastname, infixes, cid, dateofbirth, [dbo].[Child].id as external_child_id
            FROM [dbo].[Child]
            LEFT JOIN [dbo].[Person] ON ([dbo].[Person].id = [dbo].[Child].id)";

        using var connection = new SqlConnection(mssqlConnectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        var migratedCount = 0;
        var skippedCount = 0;

        Console.WriteLine("Reading children data from MSSQL...");

        while (await reader.ReadAsync())
        {
            string firstName = null, lastName = null, infixes = null, cid = null;
            DateOnly dateOfBirth = DateOnly.MinValue; // Changed to DateOnly
            int? externalChildId = null;

            try
            {
                firstName = DatabaseHelper.GetSafeString(reader, "firstname");
                lastName = DatabaseHelper.GetSafeString(reader, "lastname");
                infixes = DatabaseHelper.GetSafeString(reader, "infixes");
                cid = DatabaseHelper.GetSafeString(reader, "cid");
                externalChildId = reader.IsDBNull("external_child_id") ? null : reader.GetInt32("external_child_id");
                if (!reader.IsDBNull("dateofbirth"))
                {
                    var dob = reader.GetDateTime("dateofbirth");
                    dateOfBirth = DateOnly.FromDateTime(dob); // Convert DateTime to DateOnly
                }

                // Skip if essential data is missing
                if (string.IsNullOrWhiteSpace(firstName) && string.IsNullOrWhiteSpace(lastName))
                {
                    skippedCount++;
                    continue;
                }

                // Combine lastname and infixes for FamilyName
                var familyName = string.IsNullOrWhiteSpace(infixes)
                    ? lastName
                    : string.IsNullOrWhiteSpace(lastName)
                        ? infixes
                        : $"{infixes} {lastName}";

                var childId = Guid.NewGuid();
                var isOlderThanFive = dateOfBirth.AddYears(5) < DateOnly.FromDateTime(DateTime.UtcNow); // Adjusted for DateOnly
                var child = new Child
                {
                    Id = childId,
                    GivenName = firstName?.Trim(),
                    FamilyName = familyName?.Trim(),
                    CID = cid?.Trim(),
                    DateOfBirth = dateOfBirth,
                    TenantId = tenantId
                };

                // Archive if older than 5 years
                if (isOlderThanFive)
                    child.Archive();

                _context.Children.Add(child);

                // Store the mapping if we have an external child ID
                if (externalChildId.HasValue)
                {
                    childIdMapping[externalChildId.Value] = childId;
                }

                migratedCount++;

                // Batch save every 100 records
                if (migratedCount % 100 == 0)
                {
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Migrated {migratedCount} children...");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing record: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                Console.WriteLine($"Data: firstName={firstName}, lastName={lastName}, infixes={infixes}, cid={cid}, dateOfBirth={dateOfBirth}, externalChildId={externalChildId}");
                skippedCount++;
            }
        }

        // Save any remaining records
        if (_context.ChangeTracker.HasChanges())
        {
            await _context.SaveChangesAsync();
        }

        Console.WriteLine($"Children migration completed: {migratedCount} children migrated, {skippedCount} skipped");
        Console.WriteLine($"Child ID mapping created with {childIdMapping.Count} entries");

        return childIdMapping;
    }

    public async Task<Dictionary<int, Guid>> BuildChildIdMappingFromExistingData()
    {
        Console.WriteLine("Building child ID mapping from existing children data...");

        var childIdMapping = new Dictionary<int, Guid>();
        var mssqlConnectionString = _configuration.GetConnectionString("MSSQLSourceConnectionString");

        if (string.IsNullOrEmpty(mssqlConnectionString))
        {
            throw new InvalidOperationException("MSSQLSourceConnectionString not found in configuration");
        }

        // Get all children from CRM database ordered by creation time or ID
        var existingChildren = await _context.Children
            .OrderBy(c => c.Id)
            .ToListAsync();

        // Get external children from MSSQL in the same order as they were migrated
        var query = @"
            SELECT [dbo].[Child].id as external_child_id
            FROM [dbo].[Child]
            LEFT JOIN [dbo].[Person] ON ([dbo].[Person].id = [dbo].[Child].id)
            ORDER BY [dbo].[Child].id";

        using var connection = new SqlConnection(mssqlConnectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        var index = 0;
        while (await reader.ReadAsync() && index < existingChildren.Count)
        {
            var externalChildId = reader.GetInt32("external_child_id");
            var internalChild = existingChildren[index];

            childIdMapping[externalChildId] = internalChild.Id;
            index++;
        }

        Console.WriteLine($"Built child ID mapping with {childIdMapping.Count} entries");
        return childIdMapping;
    }
}
