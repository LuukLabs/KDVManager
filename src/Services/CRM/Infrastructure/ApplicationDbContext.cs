using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Application.Contracts.Services;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using KDVManager.Services.CRM.Domain.Interfaces;

namespace KDVManager.Services.CRM.Infrastructure;

public class ApplicationDbContext : DbContext
{
    public ITenantService _tenantService;
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantService tenantService) : base(options)
    {
        _tenantService = tenantService;
    }

    public DbSet<Child> Children { get; set; }
    public DbSet<Person> People { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Child>().HasQueryFilter(a => a.TenantId == _tenantService.Tenant);
        modelBuilder.Entity<Person>().HasQueryFilter(a => a.TenantId == _tenantService.Tenant);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                case EntityState.Modified:
                    entry.Entity.TenantId = _tenantService.Tenant;
                    break;
            }
        }
        var result = await base.SaveChangesAsync(cancellationToken);
        return result;
    }
}
