using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTimeSlotToRecurringSchedulePattern : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TimeSlotId",
                table: "RecurringSchedulePatterns",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<Guid>(
                name: "TimeSlotId",
                table: "RecurringSchedulePatterns",
                oldDefaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                defaultValue: null
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TimeSlotId",
                table: "RecurringSchedulePatterns");
        }
    }
}
