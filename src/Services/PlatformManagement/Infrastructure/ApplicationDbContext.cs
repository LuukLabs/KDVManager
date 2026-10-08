using KDVManager.Services.PlatformManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KDVManager.Services.PlatformManagement.Infrastructure;

/// <summary>
/// Platform-level context: tenants are the managed resource, so there is no
/// tenant query filter or tenancy enforcement here.
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
