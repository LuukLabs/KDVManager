using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupForeignKeyToScheduleRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ScheduleRules_GroupId",
                table: "ScheduleRules",
                column: "GroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleRules_Groups_GroupId",
                table: "ScheduleRules",
                column: "GroupId",
                principalTable: "Groups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleRules_Groups_GroupId",
                table: "ScheduleRules");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleRules_GroupId",
                table: "ScheduleRules");
        }
    }
}
