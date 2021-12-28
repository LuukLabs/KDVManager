using System;
using KDVManager.Services.GroupManagement.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace KDVManager.Services.GroupManagement.Persistence.Configurations
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
