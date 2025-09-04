using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsSystemGeneratedToEndMark : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSystemGenerated",
                table: "EndMarks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // Mark existing EndMarks with specific description as system-generated
            migrationBuilder.Sql(@"
                UPDATE ""EndMarks"" 
                SET ""IsSystemGenerated"" = true 
                WHERE ""Reason"" = 'Automatisch einde: kind wordt 4'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSystemGenerated",
                table: "EndMarks");
        }
    }
}
