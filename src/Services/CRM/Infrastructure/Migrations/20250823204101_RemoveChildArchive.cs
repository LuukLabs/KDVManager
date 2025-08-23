using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KDVManager.Services.CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveChildArchive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "Children");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAt",
                table: "Children",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}
