using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KDVManager.Services.CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ResetChildNumbersBasedOnMax : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update the sequences to continue from the current maximum child numbers
            migrationBuilder.Sql(@"
                WITH current_max_numbers AS (
                    SELECT 
                        ""TenantId"",
                        CASE 
                            WHEN MAX(""ChildNumber"") IS NULL THEN 1
                            ELSE MAX(""ChildNumber"") + 1
                        END as next_child_number
                    FROM ""Children""
                    GROUP BY ""TenantId""
                )
                UPDATE ""ChildNumberSequences""
                SET ""NextChildNumber"" = cmn.next_child_number
                FROM current_max_numbers cmn
                WHERE ""ChildNumberSequences"".""TenantId"" = cmn.""TenantId"";
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // This migration only updates sequences, so rollback would require 
            // restoring the previous sequence values from backup
            // Since we don't store the previous values, rollback is not supported
        }
    }
}
