using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTimeSlotIdForeignKeyToScheduleRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ScheduleRules_TimeSlotId",
                table: "ScheduleRules",
                column: "TimeSlotId");

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleRules_TimeSlots_TimeSlotId",
                table: "ScheduleRules",
                column: "TimeSlotId",
                principalTable: "TimeSlots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleRules_TimeSlots_TimeSlotId",
                table: "ScheduleRules");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleRules_TimeSlotId",
                table: "ScheduleRules");
        }
    }
}
