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

            builder.Property(e => e.Allergies)
                .HasMaxLength(1000);

            builder.Property(e => e.Medication)
                .HasMaxLength(1000);

            builder.Property(e => e.DietaryRequirements)
                .HasMaxLength(1000);

            builder.Property(e => e.MedicalNotes)
                .HasMaxLength(2000);

            // Ensure unique child number per tenant
            builder.HasIndex(e => new { e.TenantId, e.ChildNumber })
                .IsUnique();
        }
    }
}
