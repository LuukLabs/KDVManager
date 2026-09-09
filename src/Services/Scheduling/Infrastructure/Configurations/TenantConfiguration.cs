using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KDVManager.Services.Scheduling.Infrastructure.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants");

        builder.HasKey(t => t.Id);

        // Id mirrors the tenant identifier from the auth token; never generated.
        builder.Property(t => t.Id)
            .ValueGeneratedNever();

        builder.Property(t => t.TrialStartDate)
            .IsRequired();

        builder.Property(t => t.IsSubscribed)
            .IsRequired();
    }
}
