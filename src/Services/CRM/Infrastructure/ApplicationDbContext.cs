using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using KDVManager.Services.CRM.Domain.Interfaces;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.CRM.Infrastructure;

public class ApplicationDbContext : DbContext
{
    public ITenancyContextAccessor _tenancyContextAccessor;
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenancyContextAccessor tenancyContextAccessor) : base(options)
    {
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    public DbSet<Child> Children { get; set; }
    public DbSet<Guardian> Guardians { get; set; }
    public DbSet<ChildGuardian> ChildGuardians { get; set; }
    public DbSet<ChildNumberSequence> ChildNumberSequences { get; set; }
    // PhoneNumbers owned by Guardian; no separate DbSet

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Child>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<Guardian>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<ChildGuardian>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<ChildNumberSequence>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        // PhoneNumbers owned; query filter handled via Guardian

        modelBuilder.Entity<ChildGuardian>()
            .HasOne<Child>()
            .WithMany()
            .HasForeignKey(cg => cg.ChildId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChildGuardian>()
            .HasOne<Guardian>()
            .WithMany()
            .HasForeignKey(cg => cg.GuardianId)
            .OnDelete(DeleteBehavior.Cascade);

        // Ensure unique child-guardian relationships
        modelBuilder.Entity<ChildGuardian>()
            .HasIndex(cg => new { cg.ChildId, cg.GuardianId })
            .IsUnique();

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                case EntityState.Modified:
                    entry.Entity.TenantId = _tenancyContextAccessor.Current!.TenantId;
                    break;
            }
        }
        var result = await base.SaveChangesAsync(cancellationToken);
        return result;
    }
}
