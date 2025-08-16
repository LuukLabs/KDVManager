using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KDVManager.Services.CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConvertPhoneNumbersToOwned : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PhoneNumbers_Guardians_GuardianId",
                table: "PhoneNumbers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PhoneNumbers",
                table: "PhoneNumbers");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "PhoneNumbers");

            migrationBuilder.RenameTable(
                name: "PhoneNumbers",
                newName: "GuardianPhoneNumbers");

            migrationBuilder.RenameIndex(
                name: "IX_PhoneNumbers_GuardianId_Type",
                table: "GuardianPhoneNumbers",
                newName: "IX_GuardianPhoneNumbers_GuardianId_Type");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GuardianPhoneNumbers",
                table: "GuardianPhoneNumbers",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GuardianPhoneNumbers_Guardians_GuardianId",
                table: "GuardianPhoneNumbers",
                column: "GuardianId",
                principalTable: "Guardians",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GuardianPhoneNumbers_Guardians_GuardianId",
                table: "GuardianPhoneNumbers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GuardianPhoneNumbers",
                table: "GuardianPhoneNumbers");

            migrationBuilder.RenameTable(
                name: "GuardianPhoneNumbers",
                newName: "PhoneNumbers");

            migrationBuilder.RenameIndex(
                name: "IX_GuardianPhoneNumbers_GuardianId_Type",
                table: "PhoneNumbers",
                newName: "IX_PhoneNumbers_GuardianId_Type");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "PhoneNumbers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_PhoneNumbers",
                table: "PhoneNumbers",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PhoneNumbers_Guardians_GuardianId",
                table: "PhoneNumbers",
                column: "GuardianId",
                principalTable: "Guardians",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
