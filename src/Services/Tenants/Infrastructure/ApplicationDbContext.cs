using KDVManager.Services.Tenants.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.Tenants.Infrastructure;

/// <summary>
/// This service manages tenants themselves, so it operates above tenant scope:
/// unlike CRM/Scheduling, entities here are not IMustHaveTenant and there is no
/// per-request tenant query filter or tenancy enforcement on save.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Tenant> Tenants { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
