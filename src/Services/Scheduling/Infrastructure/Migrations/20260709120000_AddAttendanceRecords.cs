using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KDVManager.Services.Scheduling.Infrastructure.Migrations;

[Migration("20260709120000_AddAttendanceRecords")]
public partial class AddAttendanceRecords : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "AttendanceRecords",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                ChildId = table.Column<Guid>(type: "uuid", nullable: false),
                Date = table.Column<DateOnly>(type: "date", nullable: false),
                CheckedInAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                CheckedOutAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                CreatedBySubject = table.Column<string>(type: "text", nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AttendanceRecords", x => x.Id);
                table.ForeignKey("FK_AttendanceRecords_Children_ChildId", x => x.ChildId, "Children", "Id", onDelete: ReferentialAction.Cascade);
            });
        migrationBuilder.CreateIndex(name: "IX_AttendanceRecords_TenantId_ChildId_Date", table: "AttendanceRecords", columns: new[] { "TenantId", "ChildId", "Date" }, unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropTable(name: "AttendanceRecords");
}
