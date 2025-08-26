using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KDVManager.Services.CRM.Infrastructure.Configurations
{
    public class ChildConfiguration : IEntityTypeConfiguration<Child>
    {
        public ChildConfiguration()
        {
        }

        public void Configure(EntityTypeBuilder<Child> builder)
        {
            builder.Property(e => e.FamilyName)
                .IsRequired();

            builder.Property(e => e.TenantId)
                .IsRequired();

            builder.Property(e => e.ChildNumber)
                .IsRequired();

            // Ensure unique child number per tenant
            builder.HasIndex(e => new { e.TenantId, e.ChildNumber })
                .IsUnique();
        }
    }
}
