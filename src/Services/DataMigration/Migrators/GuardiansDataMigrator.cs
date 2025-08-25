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
using KDVManager.Services.CRM.Domain.Entities; // For PhoneNumber

namespace KDVManager.Services.DataMigration.Migrators;

public class GuardiansDataMigrator
{
    private readonly CrmContext _context;
    private readonly IConfiguration _configuration;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;
    private readonly Services.NameAnonymizer _anonymizer;
    private readonly bool _anonymize;

    public GuardiansDataMigrator(CrmContext context, IConfiguration configuration, ITenancyContextAccessor tenancyContextAccessor, Services.NameAnonymizer anonymizer)
    {
        _context = context;
        _configuration = configuration;
        _tenancyContextAccessor = tenancyContextAccessor;
        _anonymizer = anonymizer;
        _anonymize = bool.TryParse(configuration["DataMigration:Anonymize"], out var anon) && anon;
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

                // Use deterministic GUID if external ID available, else random
                Guid guardianId;
                if (externalGuardianId.HasValue)
                {
                    guardianId = DeterministicGuid.Create(tenantId, $"guardian:{externalGuardianId.Value}");
                }
                else
                {
                    guardianId = Guid.NewGuid();
                }

                string? given = firstName?.Trim();
                string? family = familyName?.Trim();
                string? emailOut = email?.Trim();
                if (_anonymize)
                {
                    (given, family) = _anonymizer.Anonymize(given, family);
                    emailOut = _anonymizer.AnonymizeEmail(emailOut);
                }

                var guardian = new Guardian
                {
                    Id = guardianId,
                    GivenName = given,
                    FamilyName = family,
                    DateOfBirth = dateOfBirth,
                    Email = emailOut,
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
                            guardian.AddPhoneNumber(phone.GetMaskedE123(_anonymize), phone.Type);
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

    private record RawPhone(string RawAreaCode, string RawNumber, string FormattedE123, PhoneNumberType Type)
    {
        public string GetMaskedE123(bool anonymize)
        {
            if (!anonymize) return FormattedE123;
            var chars = FormattedE123.ToCharArray();
            int replaced = 0;
            for (int i = chars.Length - 1; i >= 0 && replaced < 3; i--)
            {
                if (char.IsDigit(chars[i]))
                {
                    chars[i] = '0';
                    replaced++;
                }
            }
            return new string(chars);
        }
    }

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
                var areaCodeRaw = DatabaseHelper.GetSafeString(reader, "AreaCode") ?? string.Empty;
                var numberRaw = DatabaseHelper.GetSafeString(reader, "Number") ?? string.Empty;
                var typeId = DatabaseHelper.GetSafeInt(reader, "TypeId");

                if (!personId.HasValue || (string.IsNullOrWhiteSpace(areaCodeRaw) && string.IsNullOrWhiteSpace(numberRaw)))
                {
                    Console.WriteLine($"--- PHONE (skipped: no digits) AreaCode='{areaCodeRaw}' Number='{numberRaw}' PersonId='{personId}'");
                    continue;
                }

                // Concatenate: some legacy rows have full number in area code or number; merge then split heuristically.
                var allDigits = new string((areaCodeRaw + numberRaw).Where(char.IsDigit).ToArray());
                if (string.IsNullOrEmpty(allDigits))
                {
                    Console.WriteLine($"--- PHONE (skipped: no digit chars) AreaCode='{areaCodeRaw}' Number='{numberRaw}' PersonId='{personId}'");
                    continue;
                }

                // Trim leading + or zeros (keep one possible trunk 0 for mobile heuristic) then process.
                // We'll store a simple E.123: +31 <area?> <subscriber>
                // Heuristic: NL mobile starts with '6' after trunk '0', geographic area codes vary (2-4 digits).
                // We'll attempt: if after removing country assumptions we have length >=9.
                var digits = allDigits.TrimStart('0'); // drop initial trunk zeros
                if (digits.Length < 6)
                {
                    Console.WriteLine($"--- PHONE (skipped: too short) Combined='{allDigits}' PersonId='{personId}'");
                    continue;
                }

                string areaDigits = string.Empty;
                string subscriberDigits = digits;

                // Basic split heuristic: try mobile pattern first (starts with 6 and length 8 or 9 subscriber)
                if (digits.StartsWith("6") && digits.Length >= 8 && digits.Length <= 9)
                {
                    areaDigits = "6";
                    subscriberDigits = digits[1..];
                }
                else
                {
                    // Try common geographic area code lengths (2 to 4). We'll pick the shortest that leaves a subscriber >=5.
                    for (int len = 2; len <= 4; len++)
                    {
                        if (digits.Length - len >= 5)
                        {
                            areaDigits = digits[..len];
                            subscriberDigits = digits[len..];
                            break;
                        }
                    }
                    if (string.IsNullOrEmpty(areaDigits))
                    {
                        // Fallback: no split
                        subscriberDigits = digits;
                    }
                }

                var phoneType = MapPhoneType(typeId);
                var formatted = string.IsNullOrEmpty(areaDigits)
                    ? $"{defaultCountryCode} {subscriberDigits}"
                    : $"{defaultCountryCode} {areaDigits} {subscriberDigits}";

                if (!result.TryGetValue(personId.Value, out var list))
                {
                    list = new List<RawPhone>();
                    result[personId.Value] = list;
                }
                list.Add(new RawPhone(areaCodeRaw, numberRaw, formatted, phoneType));
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