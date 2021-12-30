using System;
using KDVManager.Services.ChildManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.ChildManagement.Persistence
{
    public class ChildManagementDbContext : DbContext
    {
        private DbSet<Child> children;

        public ChildManagementDbContext(DbContextOptions<ChildManagementDbContext> options) : base(options)
        {
        }

        public DbSet<Child> Children { get => children; set => children = value; }
    }
}
