# Children Data Migration Tool

This is a one-time migration tool that reads children data from an MSSQL database and imports it into the KDVManager CRM PostgreSQL database.

## What it does

The migration script:
1. Connects to your source MSSQL database
2. Executes the query: `SELECT firstname, lastname, infixes, cid, dateofbirth, gender FROM [dbo].[Child] LEFT JOIN [dbo].[Person] ON ([dbo].[Person].id = [dbo].[Child].id)`
3. Combines `infixes` and `lastname` into the `FamilyName` field
4. Maps gender strings to the Gender enum (Male, Female, Other)
5. Inserts the data into the CRM PostgreSQL database

## Setup Instructions

1. **Update Connection String**: Edit `appsettings.json` and update the `MSSQLSourceConnectionString` with your actual MSSQL server details:
   ```json
   "MSSQLSourceConnectionString": "Server=your-server;Database=your-database;User ID=your-user;Password=your-password;TrustServerCertificate=true"
   ```

2. **Ensure CRM Database is Running**: Make sure your PostgreSQL CRM database is running and accessible. If the database doesn't exist, create it first:
   ```sql
   CREATE DATABASE "KDVManagerCRMDB";
   ```
   
3. **Run Database Migrations**: Make sure the CRM database schema is up-to-date by running migrations from the CRM/Api directory:
   ```bash
   cd ../Api
   dotnet ef database update
   cd ../DataMigration
   ```

4. **Build the Migration Tool**:
   ```bash
   dotnet build
   ```

5. **Run the Migration** (from this directory):
   ```bash
   dotnet run
   ```

## Data Mapping

- `firstname` → `GivenName`
- `lastname` + `infixes` → `FamilyName` (combined as "infixes lastname")
- `cid` → `CID`
- `dateofbirth` → `DateOfBirth`
- `gender` → `Gender` (mapped to enum: m/male/man/boy → Male, f/female/woman/girl/v/vrouw → Female, others → Other)

## Notes

- The migration uses a default tenant ID for all imported records
- Records with missing first name AND last name are skipped
- The migration processes records in batches of 100 for better performance
- This is a one-time migration tool - run it only once per environment

## Error Handling

- Invalid records are skipped and logged
- The migration will continue even if individual records fail
- A summary is provided at the end showing migrated vs skipped records
- **Data Type Flexibility**: The migration tool handles different data types from the source database (e.g., integer CIDs, string genders) by safely converting them to strings

## Troubleshooting

- **Type Casting Errors**: If you see "Unable to cast object of type 'System.Int32' to type 'System.String'" errors, this is normal - the tool handles mixed data types automatically
- **Database Connection Issues**: Ensure both MSSQL source and PostgreSQL target databases are accessible
- **Missing Database**: If you get "database does not exist" error, create the PostgreSQL database first and run EF migrations
