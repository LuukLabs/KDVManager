using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendance : Migration
    {
        /// <inheritdoc />
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
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_Children_ChildId",
                        column: x => x.ChildId,
                        principalTable: "Children",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceAuditEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    AttendanceRecordId = table.Column<Guid>(type: "uuid", nullable: false),
                    PreviousCheckedInAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    PreviousCheckedOutAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CheckedInAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CheckedOutAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ActorSubject = table.Column<string>(type: "text", nullable: false),
                    OccurredAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceAuditEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttendanceAuditEntries_AttendanceRecords_AttendanceRecordId",
                        column: x => x.AttendanceRecordId,
                        principalTable: "AttendanceRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAuditEntries_AttendanceRecordId",
                table: "AttendanceAuditEntries",
                column: "AttendanceRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAuditEntries_TenantId_AttendanceRecordId_Occurred~",
                table: "AttendanceAuditEntries",
                columns: new[] { "TenantId", "AttendanceRecordId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_ChildId",
                table: "AttendanceRecords",
                column: "ChildId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_TenantId_ChildId_Date",
                table: "AttendanceRecords",
                columns: new[] { "TenantId", "ChildId", "Date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttendanceAuditEntries");

            migrationBuilder.DropTable(
                name: "AttendanceRecords");
        }
    }
}
