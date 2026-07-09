using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable
namespace KDVManager.Services.Scheduling.Infrastructure.Migrations;
[Migration("20260709123000_AddAttendanceAuditEntries")]
public partial class AddAttendanceAuditEntries : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(name: "AttendanceAuditEntries", columns: table => new
        {
            Id = table.Column<Guid>(type: "uuid", nullable: false), TenantId = table.Column<Guid>(type: "uuid", nullable: false),
            AttendanceRecordId = table.Column<Guid>(type: "uuid", nullable: false), PreviousCheckedInAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true), PreviousCheckedOutAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
            CheckedInAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true), CheckedOutAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true), ActorSubject = table.Column<string>(type: "text", nullable: false), OccurredAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
        }, constraints: table => table.PrimaryKey("PK_AttendanceAuditEntries", x => x.Id));
        migrationBuilder.CreateIndex(name: "IX_AttendanceAuditEntries_TenantId_AttendanceRecordId_OccurredAt", table: "AttendanceAuditEntries", columns: new[] { "TenantId", "AttendanceRecordId", "OccurredAt" });
    }
    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropTable(name: "AttendanceAuditEntries");
}
