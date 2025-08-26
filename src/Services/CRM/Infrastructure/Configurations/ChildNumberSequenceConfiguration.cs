using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KDVManager.Services.CRM.Infrastructure.Configurations
{
    public class ChildNumberSequenceConfiguration : IEntityTypeConfiguration<ChildNumberSequence>
    {
        public void Configure(EntityTypeBuilder<ChildNumberSequence> builder)
        {
            builder.Property(e => e.TenantId)
                .IsRequired();

            builder.Property(e => e.NextChildNumber)
                .IsRequired();

            // Ensure only one sequence per tenant
            builder.HasIndex(e => e.TenantId)
                .IsUnique();
        }
    }
}
