using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KDVManager.Services.CRM.Infrastructure.Configurations;

public class GuardianConfiguration : IEntityTypeConfiguration<Guardian>
{
    public void Configure(EntityTypeBuilder<Guardian> builder)
    {
        builder.HasKey(g => g.Id);

        builder.OwnsMany(g => g.PhoneNumbers, pn =>
        {
            pn.WithOwner().HasForeignKey("GuardianId");
            pn.Property(p => p.Id).ValueGeneratedNever();
            pn.Property(p => p.Number).IsRequired().HasMaxLength(20);
            pn.Property(p => p.Type).IsRequired();
            pn.HasKey("Id");
            pn.ToTable("GuardianPhoneNumbers");
            pn.HasIndex("GuardianId", "Type");
        });

        builder.Navigation(g => g.PhoneNumbers).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
