using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KDVManager.Services.CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIdIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Guardians_TenantId",
                table: "Guardians",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ChildGuardians_TenantId",
                table: "ChildGuardians",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ChildActivityIntervals_TenantId",
                table: "ChildActivityIntervals",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Guardians_TenantId",
                table: "Guardians");

            migrationBuilder.DropIndex(
                name: "IX_ChildGuardians_TenantId",
                table: "ChildGuardians");

            migrationBuilder.DropIndex(
                name: "IX_ChildActivityIntervals_TenantId",
                table: "ChildActivityIntervals");
        }
    }
}
