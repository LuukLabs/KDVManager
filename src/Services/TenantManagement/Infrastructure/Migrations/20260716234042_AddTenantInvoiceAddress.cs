using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KDVManager.Services.TenantManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantInvoiceAddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InvoiceAddress",
                table: "Tenants",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InvoiceAddress",
                table: "Tenants");
        }
    }
}
