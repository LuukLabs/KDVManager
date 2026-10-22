using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KDVManager.Services.CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWaitlistPlacementPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CareType",
                table: "WaitlistEntries",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "EndTime",
                table: "WaitlistEntries",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "WaitlistEntries",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreferredGroup",
                table: "WaitlistEntries",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "WaitlistEntries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PriorityExplanation",
                table: "WaitlistEntries",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PriorityReason",
                table: "WaitlistEntries",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Revision",
                table: "WaitlistEntries",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<TimeOnly>(
                name: "StartTime",
                table: "WaitlistEntries",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<int[]>(
                name: "Weekdays",
                table: "WaitlistEntries",
                type: "integer[]",
                nullable: false,
                defaultValue: new int[0]);

            migrationBuilder.CreateTable(
                name: "WaitlistStatusChanges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    WaitlistEntryId = table.Column<Guid>(type: "uuid", nullable: false),
                    PreviousStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ChangedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ChangedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WaitlistStatusChanges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WaitlistStatusChanges_WaitlistEntries_WaitlistEntryId",
                        column: x => x.WaitlistEntryId,
                        principalTable: "WaitlistEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WaitlistEntries_TenantId_Location_DesiredStartDate",
                table: "WaitlistEntries",
                columns: new[] { "TenantId", "Location", "DesiredStartDate" });

            migrationBuilder.CreateIndex(
                name: "IX_WaitlistStatusChanges_TenantId_WaitlistEntryId_ChangedAt",
                table: "WaitlistStatusChanges",
                columns: new[] { "TenantId", "WaitlistEntryId", "ChangedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_WaitlistStatusChanges_WaitlistEntryId",
                table: "WaitlistStatusChanges",
                column: "WaitlistEntryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WaitlistStatusChanges");

            migrationBuilder.DropIndex(
                name: "IX_WaitlistEntries_TenantId_Location_DesiredStartDate",
                table: "WaitlistEntries");

            migrationBuilder.DropColumn(
                name: "CareType",
                table: "WaitlistEntries");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "WaitlistEntries");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "WaitlistEntries");

            migrationBuilder.DropColumn(
                name: "PreferredGroup",
                table: "WaitlistEntries");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "WaitlistEntries");

            migrationBuilder.DropColumn(
                name: "PriorityExplanation",
                table: "WaitlistEntries");

            migrationBuilder.DropColumn(
                name: "PriorityReason",
                table: "WaitlistEntries");

            migrationBuilder.DropColumn(
                name: "Revision",
                table: "WaitlistEntries");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "WaitlistEntries");

            migrationBuilder.DropColumn(
                name: "Weekdays",
                table: "WaitlistEntries");
        }
    }
}
