using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KDVManager.Services.TenantManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantSubscriptionStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SubscriptionStatus",
                table: "Tenants",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubscriptionStatus",
                table: "Tenants");
        }
    }
}
