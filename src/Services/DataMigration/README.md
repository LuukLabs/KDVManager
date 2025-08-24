# Data Migration Tool

Migrates legacy MSSQL data (Children, Guardians, Scheduling) into KDVManager PostgreSQL databases (CRM + Scheduling). A tenant id is REQUIRED (no default).

## What it does

1. Connects to legacy MSSQL.
2. Migrates Children (CRM) and mirrors them into Scheduling.
3. Migrates Guardians (+ phone numbers) and guardian-child relationships.
4. Migrates Scheduling (TimeSlots, Groups, Schedules, ScheduleRules) and recalculates schedule end dates.
5. Generates EndMarks and ClosurePeriods.
6. Optional anonymization: pseudonymizes given/family names, guardian emails (full), and masks last 3 digits of guardian phone numbers.
7. Deterministic UUIDs: Children and Guardians receive stable UUIDv5-derived identifiers based on TenantId + legacy numeric ID, ensuring idempotent re-runs without breaking foreign keys.

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

5. **Run the Migration** (from this directory) - tenant is mandatory:
   ```bash
   # Full migration
   dotnet run -- --tenant 11111111-2222-3333-4444-555555555555

   # Full migration with anonymization
   dotnet run -- --tenant 11111111-2222-3333-4444-555555555555 --anonymize
   ```

### CLI Options

| Option | Required | Description |
| ------ | -------- | ----------- |
| `--tenant <GUID>` | Yes | Tenant id to attribute all migrated data to (no default) |
| `--anonymize` | No | Pseudonymize names, guardian emails, mask phone digits |
| `--test-connections` | No | Only test database connections and exit |

## Data Mapping (selected)

- Child: firstname → GivenName; infixes+lastname → FamilyName
- Guardian: firstname/infixes/lastname merged similarly; phone numbers normalized; emails anonymized if flag
- Scheduling: time slots & groups deduplicated; schedules & rules recreated with calculated end dates

## Notes

- Tenant id must be provided explicitly.
- Records with missing first & last name are skipped.
- Batches of 100 for performance.
- Safe to re-run; existing tenant data in target tables is cleared before inserting (per migrator logic).
- Deterministic IDs: When a legacy external ID is available, the tool derives a UUID using SHA1(namespace=TenantId, name="entityType:legacyId"). This guarantees identical GUIDs across runs for the same tenant + legacy ID pair while avoiding collisions between tenants.
- Anonymization creates deterministic pseudonyms (stable across runs with same input).
- Guardian emails become `u<token>@anon.<tld>`; last 3 digits of each guardian phone number set to 0 when anonymized.

## Error Handling

- Invalid records are skipped and logged
- The migration will continue even if individual records fail
- A summary is provided at the end showing migrated vs skipped records
- **Data Type Flexibility**: The migration tool handles different data types from the source database (e.g., integer CIDs, string genders) by safely converting them to strings

## Troubleshooting

- **Type Casting Errors**: If you see "Unable to cast object of type 'System.Int32' to type 'System.String'" errors, this is normal - the tool handles mixed data types automatically
- **Database Connection Issues**: Ensure both MSSQL source and PostgreSQL target databases are accessible
- **Missing Database**: If you get "database does not exist" error, create the PostgreSQL database first and run EF migrations
