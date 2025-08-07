using System.Data;
using Microsoft.Data.SqlClient;

namespace KDVManager.Services.DataMigration.Utilities;

public static class DatabaseHelper
{
    public static string GetSafeString(SqlDataReader reader, string columnName)
    {
        if (reader.IsDBNull(columnName))
            return null;

        var value = reader.GetValue(columnName);
        return value?.ToString();
    }

    public static int? GetSafeInt(SqlDataReader reader, string columnName)
    {
        if (reader.IsDBNull(columnName))
            return null;

        return reader.GetInt32(columnName);
    }
}
