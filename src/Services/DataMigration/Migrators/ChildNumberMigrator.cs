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
using ChildNumberSequence = KDVManager.Services.CRM.Domain.Entities.ChildNumberSequence;

namespace KDVManager.Services.DataMigration.Migrators;

public class ChildNumberMigrator
{
    private readonly CrmContext _context;
    private readonly IConfiguration _configuration;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public ChildNumberMigrator(
        CrmContext context, 
        IConfiguration configuration, 
        ITenancyContextAccessor tenancyContextAccessor)
    {
        _context = context;
        _configuration = configuration;
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    public async Task MigrateChildNumbersAsync()
    {
        var tenantId = _tenancyContextAccessor.Current.TenantId;
        Console.WriteLine($"Starting child number migration for tenant {tenantId}...");

        var mssqlConnectionString = _configuration.GetConnectionString("MSSQLSourceConnectionString");
        if (string.IsNullOrEmpty(mssqlConnectionString))
        {
            throw new InvalidOperationException("MSSQLSourceConnectionString not found in configuration");
        }

        // Query to get all children with their external IDs from the old database
        var query = @"
            SELECT [dbo].[Child].id as external_child_id
            FROM [dbo].[Child]
            WHERE [dbo].[Child].id IS NOT NULL
            ORDER BY [dbo].[Child].id";

        using var connection = new SqlConnection(mssqlConnectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        var updatedCount = 0;
        var skippedCount = 0;
        var maxChildNumber = 0;
        var childNumberUpdates = new List<(Guid ChildId, int ChildNumber)>();

        Console.WriteLine("Reading external child IDs from MSSQL...");

        while (await reader.ReadAsync())
        {
            try
            {
                var externalChildId = DatabaseHelper.GetSafeInt(reader, "external_child_id");
                
                if (!externalChildId.HasValue)
                {
                    skippedCount++;
                    continue;
                }

                // Generate the same deterministic GUID that was used during migration
                var childId = DeterministicGuid.Create(tenantId, $"child:{externalChildId.Value}");
                
                // Use the external ID as the child number
                var childNumber = externalChildId.Value;
                maxChildNumber = Math.Max(maxChildNumber, childNumber);

                childNumberUpdates.Add((childId, childNumber));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing external child ID: {ex.Message}");
                skippedCount++;
            }
        }

        Console.WriteLine($"Found {childNumberUpdates.Count} children to update with child numbers");

        // Now update the children in batches
        for (int i = 0; i < childNumberUpdates.Count; i += 100)
        {
            var batch = childNumberUpdates.Skip(i).Take(100);
            
            foreach (var (childId, childNumber) in batch)
            {
                var child = await _context.Children
                    .Where(c => c.Id == childId && c.TenantId == tenantId)
                    .FirstOrDefaultAsync();

                if (child != null)
                {
                    child.ChildNumber = childNumber;
                    updatedCount++;
                    
                    if (updatedCount % 50 == 0)
                    {
                        Console.WriteLine($"Updated {updatedCount} children...");
                    }
                }
                else
                {
                    Console.WriteLine($"Warning: Child with ID {childId} not found in database");
                    skippedCount++;
                }
            }

            // Save batch
            await _context.SaveChangesAsync();
        }

        // Update the child number sequence to start from the max number + 1
        await UpdateChildNumberSequenceAsync(tenantId, maxChildNumber);

        Console.WriteLine($"Child number migration completed: {updatedCount} children updated, {skippedCount} skipped");
        Console.WriteLine($"Child number sequence updated to start from {maxChildNumber + 1}");
    }

    private async Task UpdateChildNumberSequenceAsync(Guid tenantId, int maxChildNumber)
    {
        Console.WriteLine($"Updating child number sequence for tenant {tenantId} to start from {maxChildNumber + 1}...");

        // Find or create the sequence for this tenant
        var sequence = await _context.ChildNumberSequences
            .Where(s => s.TenantId == tenantId)
            .FirstOrDefaultAsync();

        if (sequence == null)
        {
            // Create new sequence
            sequence = new ChildNumberSequence
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                NextChildNumber = maxChildNumber + 1
            };
            _context.ChildNumberSequences.Add(sequence);
        }
        else
        {
            // Update existing sequence only if the max number is higher
            if (maxChildNumber >= sequence.NextChildNumber)
            {
                sequence.NextChildNumber = maxChildNumber + 1;
            }
        }

        await _context.SaveChangesAsync();
        Console.WriteLine($"Child number sequence updated successfully");
    }
}
