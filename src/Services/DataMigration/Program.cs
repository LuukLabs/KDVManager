// Nullable reference types enabled for correct annotation handling
#nullable enable
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

        // Check for help
        if (args.Contains("--help", StringComparer.OrdinalIgnoreCase) || args.Contains("-h", StringComparer.OrdinalIgnoreCase))
        {
            ShowHelp();
            return;
        }

        // Basic CLI parsing (very small scale, no external deps)
        bool testConnections = args.Contains("--test-connections", StringComparer.OrdinalIgnoreCase);
        bool anonymize = args.Contains("--anonymize", StringComparer.OrdinalIgnoreCase);
        bool migrateChildNumbers = args.Contains("--migrate-child-numbers", StringComparer.OrdinalIgnoreCase);
        string? tenantIdArg = null;

        for (int i = 0; i < args.Length; i++)
        {
            if (args[i].Equals("--tenant", StringComparison.OrdinalIgnoreCase) && i + 1 < args.Length)
            {
                tenantIdArg = args[i + 1];
            }
        }

        if (testConnections)
        {
            await DatabaseConnectionTest.TestConnections();
            return;
        }

        if (!Guid.TryParse(tenantIdArg, out _))
        {
            Console.WriteLine("ERROR: --tenant <GUID> is required. Aborting.");
            return;
        }

        if (migrateChildNumbers)
        {
            await RunChildNumberMigration(tenantIdArg);
            return;
        }

        await RunFullMigration(tenantIdArg, anonymize);
    }

    private static async Task RunChildNumberMigration(string? tenantIdArg)
    {
        Console.WriteLine("Running child number migration...");

        var configuration = BuildConfiguration(tenantIdArg, false);
        var serviceProvider = BuildServiceProvider(configuration, tenantIdArg);

        try
        {
            using var scope = serviceProvider.CreateScope();
            var childNumberMigrator = scope.ServiceProvider.GetRequiredService<ChildNumberMigrator>();
            await childNumberMigrator.MigrateChildNumbersAsync();

            Console.WriteLine("Child number migration completed successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Child number migration failed: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
        }
    }

    private static async Task RunFullMigration(string? tenantIdArg, bool anonymize)
    {
        Console.WriteLine("Running full migration (Children + Scheduling)...");

        var configuration = BuildConfiguration(tenantIdArg, anonymize);
        var serviceProvider = BuildServiceProvider(configuration, tenantIdArg);

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

    private static async Task RunChildrenOnlyMigration(string? tenantIdArg, bool anonymize)
    {
        Console.WriteLine("Running children-only migration...");

        var configuration = BuildConfiguration(tenantIdArg, anonymize);
        var serviceProvider = BuildServiceProvider(configuration, tenantIdArg);

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

    private static IConfiguration BuildConfiguration(string? tenantIdArg, bool anonymize)
    {
        var builder = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
            .AddEnvironmentVariables();

        var dict = new Dictionary<string, string?>
        {
            ["DataMigration:Anonymize"] = anonymize.ToString(),
            ["DataMigration:TenantIdOverride"] = tenantIdArg
        };
        builder.AddInMemoryCollection(dict!);
        return builder.Build();
    }

    private static ServiceProvider BuildServiceProvider(IConfiguration configuration, string? tenantIdArg)
    {
        var services = new ServiceCollection();
        ServiceConfiguration.ConfigureServices(services, configuration, tenantIdArg);
        return services.BuildServiceProvider();
    }

    private static void ShowHelp()
    {
        Console.WriteLine("KDVManager Data Migration Tool");
        Console.WriteLine();
        Console.WriteLine("Usage:");
        Console.WriteLine("  dotnet run [options]");
        Console.WriteLine();
        Console.WriteLine("Options:");
        Console.WriteLine("  --tenant <GUID>              Tenant ID to migrate data for (required)");
        Console.WriteLine("  --anonymize                  Anonymize personal data during migration");
        Console.WriteLine("  --test-connections           Test database connections and exit");
        Console.WriteLine("  --migrate-child-numbers      Migrate external IDs to ChildNumber field and update sequence");
        Console.WriteLine("  --help, -h                   Show this help message");
        Console.WriteLine();
        Console.WriteLine("Examples:");
        Console.WriteLine("  dotnet run --tenant 7e520828-45e6-415f-b0ba-19d56a312f7f --anonymize");
        Console.WriteLine("  dotnet run --tenant 7e520828-45e6-415f-b0ba-19d56a312f7f --migrate-child-numbers");
        Console.WriteLine("  dotnet run --test-connections");
    }
}

