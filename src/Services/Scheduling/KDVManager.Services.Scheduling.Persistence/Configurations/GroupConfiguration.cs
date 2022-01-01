using System;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KDVManager.Services.Scheduling.Persistence.Configurations
{
    public class GroupConfiguration : IEntityTypeConfiguration<Group>
    {
        public GroupConfiguration()
        {
        }

        public void Configure(EntityTypeBuilder<Group> builder)
        {
            builder.Property(e => e.Name)
                .IsRequired();
        }
    }
}
