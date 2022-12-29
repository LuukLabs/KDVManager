using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KDVManager.Services.CRM.Infrastructure.Migrations
{
    public partial class AddTenantIdToChild : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "DateOfBirth",
                table: "Children",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Children",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Children");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateOfBirth",
                table: "Children",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");
        }
    }
}
