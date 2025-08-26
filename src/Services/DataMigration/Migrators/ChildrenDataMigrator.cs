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
using KDVManager.Services.CRM.Application.Contracts.Services;
using CrmContext = KDVManager.Services.CRM.Infrastructure.ApplicationDbContext;
using Child = KDVManager.Services.CRM.Domain.Entities.Child;

namespace KDVManager.Services.DataMigration.Migrators;

public class ChildrenDataMigrator
{
    private readonly CrmContext _context;
    private readonly IConfiguration _configuration;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;
    private readonly IChildNumberSequenceService _childNumberSequenceService;
    private readonly Services.NameAnonymizer _anonymizer;
    private readonly bool _anonymize;

    public ChildrenDataMigrator(
        CrmContext context,
        IConfiguration configuration,
        ITenancyContextAccessor tenancyContextAccessor,
        IChildNumberSequenceService childNumberSequenceService,
        Services.NameAnonymizer anonymizer)
    {
        _context = context;
        _configuration = configuration;
        _tenancyContextAccessor = tenancyContextAccessor;
        _childNumberSequenceService = childNumberSequenceService;
        _anonymizer = anonymizer;
        _anonymize = bool.TryParse(configuration["DataMigration:Anonymize"], out var anon) && anon;
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
                externalChildId = DatabaseHelper.GetSafeInt(reader, "external_child_id");
                if (!reader.IsDBNull("dateofbirth"))
                {
                    var dob = reader.GetDateTime("dateofbirth");
                    dateOfBirth = DateOnly.FromDateTime(dob); // Convert DateTime to DateOnly
                }

                // Combine lastname and infixes for FamilyName
                var familyName = string.IsNullOrWhiteSpace(infixes)
                    ? lastName
                    : string.IsNullOrWhiteSpace(lastName)
                        ? infixes
                        : $"{infixes} {lastName}";

                Console.WriteLine($"FamilyName: {familyName}");

                // Use deterministic GUID if external ID available, else random
                Guid childId;
                if (externalChildId.HasValue)
                {
                    // Namespace: derive from tenant to avoid collisions across tenants
                    childId = DeterministicGuid.Create(tenantId, $"child:{externalChildId.Value}");
                }
                else
                {
                    childId = Guid.NewGuid();
                }
                // Check if child is older than 4.5 years (5 years and 6 months)
                var isOlderThanFourAndHalf = dateOfBirth.AddYears(4).AddMonths(6) < DateOnly.FromDateTime(DateTime.UtcNow);

                // Skip if children older than 6 years
                if (isOlderThanFourAndHalf)
                {
                    Console.WriteLine($"Skipping child {firstName} {familyName} (older than 4.5 years)");
                    skippedCount++;
                    continue;
                }

                string? given = firstName?.Trim();
                string? family = familyName?.Trim();
                if (_anonymize)
                {
                    (given, family) = _anonymizer.Anonymize(given, family);
                }

                // Get the next child number for this tenant
                var childNumber = await _childNumberSequenceService.GetNextChildNumberAsync();

                var child = new Child
                {
                    Id = childId,
                    GivenName = given,
                    FamilyName = family,
                    DateOfBirth = dateOfBirth,
                    TenantId = tenantId,
                    ChildNumber = childNumber,
                    CID = cid
                };

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
}
