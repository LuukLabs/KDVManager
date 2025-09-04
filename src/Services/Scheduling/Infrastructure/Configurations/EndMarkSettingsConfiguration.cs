using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KDVManager.Services.Scheduling.Infrastructure.Configurations;

public class EndMarkSettingsConfiguration : IEntityTypeConfiguration<EndMarkSettings>
{
    public void Configure(EntityTypeBuilder<EndMarkSettings> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId)
            .IsRequired();

        builder.Property(e => e.IsEnabled)
            .IsRequired();

        builder.Property(e => e.YearsAfterBirth)
            .IsRequired();

        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(500);

        // Ensure one settings record per tenant
        builder.HasIndex(e => e.TenantId)
            .IsUnique();
    }
}
