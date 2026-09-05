using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KDVManager.Services.CRM.Infrastructure.Configurations;

public class WaitlistEntryConfiguration : IEntityTypeConfiguration<WaitlistEntry>
{
    public void Configure(EntityTypeBuilder<WaitlistEntry> builder)
    {
        builder.Property(entry => entry.GivenName).IsRequired().HasMaxLength(50);
        builder.Property(entry => entry.FamilyName).IsRequired().HasMaxLength(100);
        builder.Property(entry => entry.ContactName).IsRequired().HasMaxLength(150);
        builder.Property(entry => entry.ContactEmail).IsRequired().HasMaxLength(254);
        builder.Property(entry => entry.ContactPhone).HasMaxLength(30);
        builder.Property(entry => entry.RequestedDays).HasMaxLength(100);
        builder.Property(entry => entry.Notes).HasMaxLength(1000);
        builder.Property(entry => entry.Status).HasConversion<string>().HasMaxLength(20);

        // This is also the default display order for the active waitlist.
        builder.HasIndex(entry => new { entry.TenantId, entry.Status, entry.RegisteredAt });
    }
}
