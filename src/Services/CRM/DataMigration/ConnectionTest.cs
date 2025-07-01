using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace KDVManager.Services.CRM.DataMigration;

public class DatabaseConnectionTest
{
    public static async Task TestConnections()
    {
        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: false)
            .Build();

        // Test PostgreSQL connection
        Console.WriteLine("Testing PostgreSQL connection...");
        var pgConnectionString = configuration.GetConnectionString("KDVManagerCRMConnectionString");
        Console.WriteLine($"Connection string: {pgConnectionString}");

        try
        {
            using var pgConnection = new NpgsqlConnection(pgConnectionString);
            await pgConnection.OpenAsync();
            Console.WriteLine("✅ PostgreSQL connection successful!");

            // Test if database exists
            using var command = new NpgsqlCommand("SELECT current_database(), version()", pgConnection);
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                Console.WriteLine($"Database: {reader.GetString(0)}");
                Console.WriteLine($"Version: {reader.GetString(1)}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ PostgreSQL connection failed: {ex.Message}");
        }

        Console.WriteLine();

        // Test MSSQL connection
        Console.WriteLine("Testing MSSQL connection...");
        var mssqlConnectionString = configuration.GetConnectionString("MSSQLSourceConnectionString");
        Console.WriteLine($"Connection string: {mssqlConnectionString.Replace(";Password=nLK9AJCR7pAAhVJeautT;", ";Password=***;")}");

        try
        {
            using var sqlConnection = new Microsoft.Data.SqlClient.SqlConnection(mssqlConnectionString);
            await sqlConnection.OpenAsync();
            Console.WriteLine("✅ MSSQL connection successful!");

            // Test if tables exist
            using var command = new Microsoft.Data.SqlClient.SqlCommand(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN ('Child', 'Person')",
                sqlConnection);
            var tableCount = (int)await command.ExecuteScalarAsync();
            Console.WriteLine($"Found {tableCount} relevant tables (Child, Person)");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ MSSQL connection failed: {ex.Message}");
        }
    }
}
