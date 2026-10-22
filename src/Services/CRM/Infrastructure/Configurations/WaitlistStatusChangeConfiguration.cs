using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KDVManager.Services.CRM.Infrastructure.Configurations;

public class WaitlistStatusChangeConfiguration : IEntityTypeConfiguration<WaitlistStatusChange>
{
    public void Configure(EntityTypeBuilder<WaitlistStatusChange> builder)
    {
        builder.Property(change => change.Id).ValueGeneratedNever();
        builder.Property(change => change.PreviousStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(change => change.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(change => change.ChangedBy).IsRequired().HasMaxLength(255);
        builder.HasIndex(change => new { change.TenantId, change.WaitlistEntryId, change.ChangedAt });
    }
}
