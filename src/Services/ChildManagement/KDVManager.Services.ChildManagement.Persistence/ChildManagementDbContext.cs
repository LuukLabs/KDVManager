using System;
using KDVManager.Services.ChildManagement.Domain.Entities;
using KDVManager.Services.ChildManagement.Application.Contracts.Services;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using KDVManager.Services.ChildManagement.Domain.Interfaces;

namespace KDVManager.Services.ChildManagement.Persistence
{
    public class ChildManagementDbContext : DbContext
    {
        public ITenantService _tenantService;
        public ChildManagementDbContext(DbContextOptions<ChildManagementDbContext> options, ITenantService tenantService) : base(options)
        {
            _tenantService = tenantService;
        }

        public DbSet<Child> Children { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Child>().HasQueryFilter(a => a.TenantId == _tenantService.TenantId);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                    case EntityState.Modified:
                        entry.Entity.TenantId = _tenantService.TenantId;
                        break;
                }
            }
            var result = await base.SaveChangesAsync(cancellationToken);
            return result;
        }
    }
}
