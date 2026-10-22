using KDVManager.Services.TenantManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KDVManager.Services.TenantManagement.Infrastructure.Configurations;

public class MembershipConfiguration : IEntityTypeConfiguration<Membership>
{
    public void Configure(EntityTypeBuilder<Membership> builder)
    {
        builder.ToTable("Memberships");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.UserId)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(m => m.Role)
            .IsRequired();

        builder.Property(m => m.CreatedAt)
            .IsRequired();

        // One membership per (tenant, user). UserId is also looked up on its own
        // during onboarding, so index it.
        builder.HasIndex(m => new { m.TenantId, m.UserId })
            .IsUnique();

        builder.HasIndex(m => m.UserId);
    }
}
