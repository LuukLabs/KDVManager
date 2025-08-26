using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KDVManager.Services.CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddChildNumberAndSequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ChildNumber",
                table: "Children",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ChildNumberSequences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    NextChildNumber = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChildNumberSequences", x => x.Id);
                });

            // Assign child numbers to existing children
            migrationBuilder.Sql(@"
                WITH child_numbers AS (
                    SELECT 
                        ""Id"",
                        ""TenantId"",
                        ROW_NUMBER() OVER (PARTITION BY ""TenantId"" ORDER BY ""Id"") as child_number
                    FROM ""Children""
                )
                UPDATE ""Children""
                SET ""ChildNumber"" = child_numbers.child_number
                FROM child_numbers
                WHERE ""Children"".""Id"" = child_numbers.""Id"";
            ");

            // Initialize sequences for each tenant
            migrationBuilder.Sql(@"
                INSERT INTO ""ChildNumberSequences"" (""Id"", ""TenantId"", ""NextChildNumber"")
                SELECT 
                    gen_random_uuid(),
                    ""TenantId"",
                    COALESCE(MAX(""ChildNumber""), 0) + 1
                FROM ""Children""
                GROUP BY ""TenantId"";
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Children_TenantId_ChildNumber",
                table: "Children",
                columns: new[] { "TenantId", "ChildNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChildNumberSequences_TenantId",
                table: "ChildNumberSequences",
                column: "TenantId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChildNumberSequences");

            migrationBuilder.DropIndex(
                name: "IX_Children_TenantId_ChildNumber",
                table: "Children");

            migrationBuilder.DropColumn(
                name: "ChildNumber",
                table: "Children");
        }
    }
}
