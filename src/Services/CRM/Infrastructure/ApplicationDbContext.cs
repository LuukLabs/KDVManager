using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Persistence;

namespace KDVManager.Services.CRM.Infrastructure;

public class ApplicationDbContext : TenantDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenancyContextAccessor tenancyContextAccessor) : base(options, tenancyContextAccessor)
    {
    }

    public DbSet<Child> Children { get; set; }
    public DbSet<Guardian> Guardians { get; set; }
    public DbSet<ChildGuardian> ChildGuardians { get; set; }
    public DbSet<ChildNumberSequence> ChildNumberSequences { get; set; }
    public DbSet<ChildActivityInterval> ChildActivityIntervals { get; set; }
    // PhoneNumbers owned by Guardian; no separate DbSet

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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

        // Configure ChildActivityInterval relationship
        modelBuilder.Entity<ChildActivityInterval>()
            .HasOne(i => i.Child)
            .WithMany(c => c.ActivityIntervals)
            .HasForeignKey(i => i.ChildId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        ApplyTenancy(modelBuilder);
    }
}
