using System;
using KDVManager.Services.GroupManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.GroupManagement.Persistence
{
    public class GroupManagementDbContext : DbContext
    {
        private DbSet<Group> groups;

        public GroupManagementDbContext(DbContextOptions<GroupManagementDbContext> options) : base(options)
        {
        }

        public DbSet<Group> Groups { get => groups; set => groups = value; }
    }
}
