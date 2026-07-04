using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIdIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_TimeSlots_TenantId",
                table: "TimeSlots",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_TenantId",
                table: "Schedules",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleRules_TenantId",
                table: "ScheduleRules",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_TenantId",
                table: "Groups",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_EndMarks_TenantId",
                table: "EndMarks",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ClosurePeriods_TenantId",
                table: "ClosurePeriods",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Children_TenantId",
                table: "Children",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Absences_TenantId",
                table: "Absences",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TimeSlots_TenantId",
                table: "TimeSlots");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_TenantId",
                table: "Schedules");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleRules_TenantId",
                table: "ScheduleRules");

            migrationBuilder.DropIndex(
                name: "IX_Groups_TenantId",
                table: "Groups");

            migrationBuilder.DropIndex(
                name: "IX_EndMarks_TenantId",
                table: "EndMarks");

            migrationBuilder.DropIndex(
                name: "IX_ClosurePeriods_TenantId",
                table: "ClosurePeriods");

            migrationBuilder.DropIndex(
                name: "IX_Children_TenantId",
                table: "Children");

            migrationBuilder.DropIndex(
                name: "IX_Absences_TenantId",
                table: "Absences");
        }
    }
}
