using System;
using KDVManager.Services.ChildManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.ChildManagement.Persistence
{
    public class MigrationDbContext : DbContext
    {
        public MigrationDbContext(DbContextOptions<MigrationDbContext> options) : base(options)
        {
        }

        public DbSet<Child> Children { get; set; }
    }
}
