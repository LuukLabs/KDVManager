using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCalendarRowCache : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CalendarRowCaches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    GroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChildId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    SlotId = table.Column<Guid>(type: "uuid", nullable: false),
                    SlotName = table.Column<string>(type: "text", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    CachedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalendarRowCaches", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CalendarRowCaches_Date",
                table: "CalendarRowCaches",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_CalendarRowCaches_GroupId",
                table: "CalendarRowCaches",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_CalendarRowCaches_GroupId_Date",
                table: "CalendarRowCaches",
                columns: new[] { "GroupId", "Date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CalendarRowCaches");
        }
    }
}
