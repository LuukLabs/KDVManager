using System;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Scheduling.Persistence
{
    public class SchedulingDbContext : DbContext
    {
        private DbSet<Group> groups;

        public SchedulingDbContext(DbContextOptions<SchedulingDbContext> options) : base(options)
        {
        }

        public DbSet<Group> Groups { get => groups; set => groups = value; }
    }
}
