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
using Guardian = KDVManager.Services.CRM.Domain.Entities.Guardian;
using ChildGuardian = KDVManager.Services.CRM.Domain.Entities.ChildGuardian;
using GuardianRelationshipType = KDVManager.Services.CRM.Domain.Entities.GuardianRelationshipType;
using PhoneNumberType = KDVManager.Services.CRM.Domain.Entities.PhoneNumberType;

namespace KDVManager.Services.DataMigration.Migrators;

public class GuardiansDataMigrator
{
    private readonly CrmContext _context;
    private readonly IConfiguration _configuration;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public GuardiansDataMigrator(CrmContext context, IConfiguration configuration, ITenancyContextAccessor tenancyContextAccessor)
    {
        _context = context;
        _configuration = configuration;
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    private async Task DeleteGuardiansForTenantAsync(Guid tenantId)
    {
        Console.WriteLine($"Deleting guardians for tenant {tenantId}...");
        await _context.Database.ExecuteSqlRawAsync(
            "DELETE FROM \"Guardians\" WHERE \"TenantId\" = {0};",
            tenantId
        );
        Console.WriteLine($"Guardians for tenant {tenantId} deleted.");
    }

    public async Task<Dictionary<int, Guid>> MigrateAsync(Dictionary<int, Guid> childIdMapping)
    {
        var guardianIdMapping = new Dictionary<int, Guid>();

        // Preload phone numbers from source so we can attach them while creating guardians
        var phoneNumbersByPersonId = await LoadPhoneNumbersAsync();

        // Retrieve tenant ID from TenantService
        var tenantId = _tenancyContextAccessor.Current.TenantId;
        await DeleteGuardiansForTenantAsync(tenantId);

        var mssqlConnectionString = _configuration.GetConnectionString("MSSQLSourceConnectionString");

        if (string.IsNullOrEmpty(mssqlConnectionString))
        {
            throw new InvalidOperationException("MSSQLSourceConnectionString not found in configuration");
        }

        var query = @"
            SELECT 
                p.FirstName, 
                p.LastName, 
                p.Infixes, 
                p.DateOfBirth, 
                p.Email,
                p.Id AS external_guardian_id
            FROM [dbo].[Person] AS p;";

        using var connection = new SqlConnection(mssqlConnectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        var migratedCount = 0;
        var skippedCount = 0;

        Console.WriteLine("Reading children data from MSSQL...");

        while (await reader.ReadAsync())
        {
            string firstName = null, lastName = null, infixes = null, email = null, familyName = null;
            DateOnly dateOfBirth = DateOnly.MinValue; // Changed to DateOnly
            int? externalGuardianId = null;

            try
            {
                firstName = DatabaseHelper.GetSafeString(reader, "firstname");
                lastName = DatabaseHelper.GetSafeString(reader, "lastname");
                infixes = DatabaseHelper.GetSafeString(reader, "infixes");
                email = DatabaseHelper.GetSafeString(reader, "email");
                externalGuardianId = DatabaseHelper.GetSafeInt(reader, "external_guardian_id");
                if (!reader.IsDBNull("dateofbirth"))
                {
                    var dob = reader.GetDateTime("dateofbirth");
                    dateOfBirth = DateOnly.FromDateTime(dob); // Convert DateTime to DateOnly
                }

                // Combine lastname and infixes for FamilyName
                familyName = $"{(infixes ?? "").Trim()} {(lastName ?? "").Trim()}".Trim();

                var guardianId = Guid.NewGuid();

                var guardian = new Guardian
                {
                    Id = guardianId,
                    GivenName = firstName?.Trim(),
                    FamilyName = familyName?.Trim(),
                    DateOfBirth = dateOfBirth,
                    Email = email?.Trim(),
                    TenantId = tenantId
                };

                _context.Guardians.Add(guardian);

                // Add phone numbers (if any) - max 10 to align with application command handler semantics
                if (externalGuardianId.HasValue && phoneNumbersByPersonId.TryGetValue(externalGuardianId.Value, out var phones))
                {
                    var added = 0;
                    foreach (var phone in phones)
                    {
                        if (added >= 10) break; // enforce limit
                        try
                        {
                            guardian.AddPhoneNumber(phone.FormattedE123, phone.Type);
                            added++;
                        }
                        catch (Exception exPhone)
                        {
                            Console.WriteLine($"Skipping phone for guardian {externalGuardianId.Value}: {exPhone.Message} (raw: {phone.RawAreaCode}-{phone.RawNumber})");
                        }
                    }
                }

                // Store the mapping if we have an external guardian ID
                if (externalGuardianId.HasValue)
                {
                    guardianIdMapping[externalGuardianId.Value] = guardianId;
                }

                migratedCount++;

                // Batch save every 100 records
                if (migratedCount % 100 == 0)
                {
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Migrated {migratedCount} guardians...");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing record: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                Console.WriteLine($"Data: firstName={firstName}, lastName={lastName}, infixes={infixes}, familyName={familyName}, dateOfBirth={dateOfBirth}, externalGuardianId={externalGuardianId}");
                skippedCount++;
            }
        }

        // Save any remaining records
        if (_context.ChangeTracker.HasChanges())
        {
            await _context.SaveChangesAsync();
        }

        Console.WriteLine($"Guardians migration completed: {migratedCount} guardians migrated, {skippedCount} skipped");
        Console.WriteLine($"Guardian ID mapping created with {guardianIdMapping.Count} entries");

        // Migrate guardian-child relationships
        await MigrateGuardianChildRelationshipsAsync(guardianIdMapping, childIdMapping);

        // Delete guardians that don't have any children linked
        await DeleteGuardiansWithoutChildrenAsync();

        return guardianIdMapping;
    }

    private record RawPhone(string RawAreaCode, string RawNumber, string FormattedE123, PhoneNumberType Type);

    /// <summary>
    /// Loads all phone numbers from the legacy MSSQL database and prepares them in E.123 format.
    /// E.123 format example: +31 6 12345678 or +31 416 123456. Internal PhoneNumber normalization will convert to E.164.
    /// </summary>
    private async Task<Dictionary<int, List<RawPhone>>> LoadPhoneNumbersAsync()
    {
        var result = new Dictionary<int, List<RawPhone>>();

        var mssqlConnectionString = _configuration.GetConnectionString("MSSQLSourceConnectionString");
        if (string.IsNullOrEmpty(mssqlConnectionString))
        {
            throw new InvalidOperationException("MSSQLSourceConnectionString not found in configuration");
        }

        var query = @"SELECT [PersonId], [AreaCode], [Number], [TypeId] FROM [dbo].[Telephone]";

        using var connection = new SqlConnection(mssqlConnectionString);
        await connection.OpenAsync();
        using var command = new SqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        const string defaultCountryCode = "+31"; // TODO: Make configurable if multi-country support needed

        while (await reader.ReadAsync())
        {
            try
            {
                var personId = DatabaseHelper.GetSafeInt(reader, "PersonId");
                var areaCode = DatabaseHelper.GetSafeString(reader, "AreaCode");
                var number = DatabaseHelper.GetSafeString(reader, "Number");
                var typeId = DatabaseHelper.GetSafeInt(reader, "TypeId");

                if (!personId.HasValue || string.IsNullOrWhiteSpace(areaCode) || string.IsNullOrWhiteSpace(number))
                {
                    continue; // insufficient data
                }

                var phoneType = MapPhoneType(typeId);

                // Build E.123 formatted number.
                // Area codes appear as 0416 or 06; remove leading 0 for international format
                var areaNoZero = areaCode.Trim();
                areaNoZero = areaNoZero.StartsWith("0") ? areaNoZero[1..] : areaNoZero;
                var nationalSubscriber = new string(number.Where(char.IsDigit).ToArray());
                var areaDigits = new string(areaNoZero.Where(char.IsDigit).ToArray());
                if (string.IsNullOrEmpty(areaDigits) || string.IsNullOrEmpty(nationalSubscriber))
                {
                    continue;
                }

                // Basic grouping: don't attempt complex spacing; keep area code separate
                var formatted = $"{defaultCountryCode} {areaDigits} {nationalSubscriber}";

                if (!result.TryGetValue(personId.Value, out var list))
                {
                    list = new List<RawPhone>();
                    result[personId.Value] = list;
                }
                list.Add(new RawPhone(areaCode, number, formatted, phoneType));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to process telephone record: {ex.Message}");
            }
        }

        Console.WriteLine($"Loaded phone numbers for {result.Count} persons from legacy DB.");
        return result;
    }

    /// <summary>
    /// Maps legacy TypeId to PhoneNumberType enum.
    /// Fallback is Other.
    /// </summary>
    private static PhoneNumberType MapPhoneType(int? typeId)
    {
        return typeId switch
        {
            1 => PhoneNumberType.Home,
            2 => PhoneNumberType.Mobile,
            3 => PhoneNumberType.Work,
            _ => PhoneNumberType.Other
        };
    }

    /// <summary>
    /// Maps old relation type IDs to the new GuardianRelationshipType enum
    /// </summary>
    private static GuardianRelationshipType MapRelationType(int oldTypeId)
    {
        return oldTypeId switch
        {
            1 => GuardianRelationshipType.Parent,
            4 => GuardianRelationshipType.Guardian,
            _ => GuardianRelationshipType.Other
        };
    }

    /// <summary>
    /// Migrates guardian-child relationships from the old database
    /// </summary>
    private async Task MigrateGuardianChildRelationshipsAsync(Dictionary<int, Guid> guardianIdMapping, Dictionary<int, Guid> childIdMapping)
    {
        Console.WriteLine("Starting guardian-child relationships migration...");

        var tenantId = _tenancyContextAccessor.Current.TenantId;

        // Delete existing relationships for this tenant
        await _context.Database.ExecuteSqlRawAsync(
            "DELETE FROM \"ChildGuardians\" WHERE \"TenantId\" = {0};",
            tenantId
        );

        var mssqlConnectionString = _configuration.GetConnectionString("MSSQLSourceConnectionString");

        if (string.IsNullOrEmpty(mssqlConnectionString))
        {
            throw new InvalidOperationException("MSSQLSourceConnectionString not found in configuration");
        }

        var relationQuery = "SELECT PersonId, RelationId, TypeId FROM [dbo].[Relation]";

        using var connection = new SqlConnection(mssqlConnectionString);
        await connection.OpenAsync();

        using var command = new SqlCommand(relationQuery, connection);
        using var reader = await command.ExecuteReaderAsync();

        var migratedRelationships = 0;
        var skippedRelationships = 0;

        Console.WriteLine("Reading guardian-child relationships from MSSQL...");

        while (await reader.ReadAsync())
        {
            try
            {
                var personId = DatabaseHelper.GetSafeInt(reader, "RelationId");
                var relationId = DatabaseHelper.GetSafeInt(reader, "PersonId"); // This is the child ID
                var typeId = DatabaseHelper.GetSafeInt(reader, "TypeId");

                if (!personId.HasValue || !relationId.HasValue || !typeId.HasValue)
                {
                    Console.WriteLine($"Skipping relationship with null values: PersonId={personId}, RelationId={relationId}, TypeId={typeId}");
                    skippedRelationships++;
                    continue;
                }

                // Check if we have mappings for both guardian and child
                if (!guardianIdMapping.TryGetValue(personId.Value, out var guardianId))
                {
                    Console.WriteLine($"Guardian not found in mapping for PersonId: {personId.Value}");
                    skippedRelationships++;
                    continue;
                }

                if (!childIdMapping.TryGetValue(relationId.Value, out var childId))
                {
                    Console.WriteLine($"Child not found in mapping for RelationId: {relationId.Value}");
                    skippedRelationships++;
                    continue;
                }

                var relationshipType = MapRelationType(typeId.Value);

                var childGuardian = new ChildGuardian
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ChildId = childId,
                    GuardianId = guardianId,
                    RelationshipType = relationshipType,
                    IsPrimaryContact = relationshipType == GuardianRelationshipType.Parent, // Assume parents are primary contacts
                    IsEmergencyContact = false // Assume all guardians can be emergency contacts
                };

                _context.Set<ChildGuardian>().Add(childGuardian);
                migratedRelationships++;

                // Batch save every 100 records
                if (migratedRelationships % 100 == 0)
                {
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Migrated {migratedRelationships} guardian-child relationships...");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing relationship: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                skippedRelationships++;
            }
        }

        // Save any remaining records
        if (_context.ChangeTracker.HasChanges())
        {
            await _context.SaveChangesAsync();
        }

        Console.WriteLine($"Guardian-child relationships migration completed: {migratedRelationships} relationships migrated, {skippedRelationships} skipped");
    }

    /// <summary>
    /// Deletes guardians that don't have any children linked to them
    /// </summary>
    private async Task DeleteGuardiansWithoutChildrenAsync()
    {
        Console.WriteLine("Starting cleanup of guardians without children...");

        var tenantId = _tenancyContextAccessor.Current.TenantId;

        // Find guardians that don't have any child relationships
        var guardiansWithoutChildren = await _context.Guardians
            .Where(g => g.TenantId == tenantId &&
                       !_context.Set<ChildGuardian>().Any(cg => cg.GuardianId == g.Id))
            .ToListAsync();

        if (guardiansWithoutChildren.Count > 0)
        {
            Console.WriteLine($"Found {guardiansWithoutChildren.Count} guardians without children. Deleting...");

            _context.Guardians.RemoveRange(guardiansWithoutChildren);
            await _context.SaveChangesAsync();

            Console.WriteLine($"Deleted {guardiansWithoutChildren.Count} guardians without children.");
        }
        else
        {
            Console.WriteLine("No guardians without children found.");
        }
    }
}