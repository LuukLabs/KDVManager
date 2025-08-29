using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAbsenceChildDateIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Absences_ChildId",
                table: "Absences");

            migrationBuilder.CreateIndex(
                name: "IX_Absences_ChildId_StartDate_EndDate",
                table: "Absences",
                columns: new[] { "ChildId", "StartDate", "EndDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Absences_ChildId_StartDate_EndDate",
                table: "Absences");

            migrationBuilder.CreateIndex(
                name: "IX_Absences_ChildId",
                table: "Absences",
                column: "ChildId");
        }
    }
}
