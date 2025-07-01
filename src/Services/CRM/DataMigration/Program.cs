using System;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using KDVManager.Services.CRM.Infrastructure;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Application.Contracts.Services;

namespace KDVManager.Services.CRM.DataMigration;

public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("Starting Children Data Migration from MSSQL to CRM...");

        // Check if we should run connection test
        if (args.Length > 0 && args[0] == "--test-connections")
        {
            await DatabaseConnectionTest.TestConnections();
            return;
        }

        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: false)
            .Build();

        var services = new ServiceCollection();
        ConfigureServices(services, configuration);

        var serviceProvider = services.BuildServiceProvider();

        try
        {
            using var scope = serviceProvider.CreateScope();
            var migrator = scope.ServiceProvider.GetRequiredService<ChildrenDataMigrator>();
            await migrator.MigrateAsync();

            Console.WriteLine("Migration completed successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Migration failed: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
        }
    }

    private static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        // Register configuration as a service
        services.AddSingleton<IConfiguration>(configuration);

        // Configure CRM Database Context
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("KDVManagerCRMConnectionString")));

        // Add tenant service with a default tenant for migration
        services.AddScoped<ITenantService, MigrationTenantService>();
        services.AddScoped<ChildrenDataMigrator>();
    }
}

public class ChildrenDataMigrator
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public ChildrenDataMigrator(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task MigrateAsync()
    {
        // Truncate the Children table before importing
        Console.WriteLine("Truncating Children table...");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"Children\" RESTART IDENTITY CASCADE;");
        Console.WriteLine("Children table truncated.");

        var mssqlConnectionString = _configuration.GetConnectionString("MSSQLSourceConnectionString");

        if (string.IsNullOrEmpty(mssqlConnectionString))
        {
            throw new InvalidOperationException("MSSQLSourceConnectionString not found in configuration");
        }

        var query = @"
            SELECT firstname, lastname, infixes, cid, dateofbirth
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
            DateTime? dateOfBirth = null;
            try
            {
                firstName = GetSafeString(reader, "firstname");
                lastName = GetSafeString(reader, "lastname");
                infixes = GetSafeString(reader, "infixes");
                cid = GetSafeString(reader, "cid");
                dateOfBirth = null;
                if (!reader.IsDBNull("dateofbirth"))
                {
                    var dob = reader.GetDateTime("dateofbirth");
                    dateOfBirth = DateTime.SpecifyKind(dob, DateTimeKind.Utc);
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

                // Do not migrate gender

                var child = new Child
                {
                    Id = Guid.NewGuid(),
                    GivenName = firstName?.Trim(),
                    FamilyName = familyName?.Trim(),
                    CID = cid?.Trim(),
                    DateOfBirth = dateOfBirth,
                    TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f")
                };

                _context.Children.Add(child);
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
                Console.WriteLine($"Data: firstName={firstName}, lastName={lastName}, infixes={infixes}, cid={cid}, dateOfBirth={dateOfBirth}");
                skippedCount++;
            }
        }

        // Save any remaining records
        if (_context.ChangeTracker.HasChanges())
        {
            await _context.SaveChangesAsync();
        }

        Console.WriteLine($"Migration completed: {migratedCount} children migrated, {skippedCount} skipped");
    }

    private static string GetSafeString(SqlDataReader reader, string columnName)
    {
        if (reader.IsDBNull(columnName))
            return null;

        var value = reader.GetValue(columnName);
        return value?.ToString();
    }
}

public class MigrationTenantService : ITenantService
{
    public Guid Tenant { get; } = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f"); // Default tenant for migration
}
