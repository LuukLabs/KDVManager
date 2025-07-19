using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using KDVManager.Services.CRM.Domain.Interfaces;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.CRM.Infrastructure;

public class ApplicationDbContext : DbContext
{
    public ITenancyContext _tenancyContext;
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenancyContext tenancyContext) : base(options)
    {
        _tenancyContext = tenancyContext;
    }

    public DbSet<Child> Children { get; set; }
    public DbSet<Person> People { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Child>().HasQueryFilter(a => a.TenantId == _tenancyContext.TenantId);
        modelBuilder.Entity<Person>().HasQueryFilter(a => a.TenantId == _tenancyContext.TenantId);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                case EntityState.Modified:
                    entry.Entity.TenantId = _tenancyContext.TenantId;
                    break;
            }
        }
        var result = await base.SaveChangesAsync(cancellationToken);
        return result;
    }
}
