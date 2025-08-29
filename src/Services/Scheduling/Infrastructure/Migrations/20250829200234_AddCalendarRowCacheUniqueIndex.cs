using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCalendarRowCacheUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_CalendarRowCaches_TenantId_GroupId_ChildId_Date_SlotId",
                table: "CalendarRowCaches",
                columns: new[] { "TenantId", "GroupId", "ChildId", "Date", "SlotId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CalendarRowCaches_TenantId_GroupId_ChildId_Date_SlotId",
                table: "CalendarRowCaches");
        }
    }
}
