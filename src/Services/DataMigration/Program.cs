using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using KDVManager.Services.DataMigration.Migrators;
using KDVManager.Services.DataMigration.Services;

namespace KDVManager.Services.DataMigration;

public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("Starting Data Migration from MSSQL to KDVManager...");

        // Check if we should run connection test
        if (args.Length > 0 && args[0] == "--test-connections")
        {
            await DatabaseConnectionTest.TestConnections();
            return;
        }

        // Default: run both migrations
        await RunFullMigration();
    }

    private static async Task RunFullMigration()
    {
        Console.WriteLine("Running full migration (Children + Scheduling)...");

        var configuration = BuildConfiguration();
        var serviceProvider = BuildServiceProvider(configuration);

        try
        {
            using var scope = serviceProvider.CreateScope();

            // First migrate children and get the mapping
            var childrenMigrator = scope.ServiceProvider.GetRequiredService<ChildrenDataMigrator>();
            var childIdMapping = await childrenMigrator.MigrateAsync();

            // Then migrate guardians using the child mapping
            var guardiansMigrator = scope.ServiceProvider.GetRequiredService<GuardiansDataMigrator>();
            await guardiansMigrator.MigrateAsync(childIdMapping);

            // Then migrate scheduling using the child mapping
            var schedulingMigrator = scope.ServiceProvider.GetRequiredService<SchedulingDataMigrator>();
            await schedulingMigrator.MigrateAsync(childIdMapping);

            Console.WriteLine("Migration completed successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Migration failed: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
        }
    }

    private static async Task RunChildrenOnlyMigration()
    {
        Console.WriteLine("Running children-only migration...");

        var configuration = BuildConfiguration();
        var serviceProvider = BuildServiceProvider(configuration);

        try
        {
            using var scope = serviceProvider.CreateScope();
            var childrenMigrator = scope.ServiceProvider.GetRequiredService<ChildrenDataMigrator>();
            await childrenMigrator.MigrateAsync();

            Console.WriteLine("Children migration completed successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Children migration failed: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
        }
    }

    private static IConfiguration BuildConfiguration()
    {
        return new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();
    }

    private static ServiceProvider BuildServiceProvider(IConfiguration configuration)
    {
        var services = new ServiceCollection();
        ServiceConfiguration.ConfigureServices(services, configuration);
        return services.BuildServiceProvider();
    }
}

