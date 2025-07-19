using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Shared.Domain.Services;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using KDVManager.Services.Scheduling.Domain.Interfaces;
using System.Reflection;
using System;

namespace KDVManager.Services.Scheduling.Infrastructure;

public class ApplicationDbContext : DbContext
{
    public ITenantService _tenantService;
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantService tenantService) : base(options)
    {
        _tenantService = tenantService;
    }

    public DbSet<Group> Groups { get; set; }
    public DbSet<TimeSlot> TimeSlots { get; set; }
    public DbSet<Schedule> Schedules { get; set; }
    public DbSet<ScheduleRule> ScheduleRules { get; set; }
    public DbSet<Child> Children { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Child>().HasQueryFilter(a => a.TenantId == _tenantService.CurrentTenant);
        modelBuilder.Entity<Group>().HasQueryFilter(a => a.TenantId == _tenantService.CurrentTenant);
        modelBuilder.Entity<TimeSlot>().HasQueryFilter(a => a.TenantId == _tenantService.CurrentTenant);
        modelBuilder.Entity<ScheduleRule>().HasQueryFilter(a => a.TenantId == _tenantService.CurrentTenant);
        modelBuilder.Entity<Schedule>().HasQueryFilter(a => a.TenantId == _tenantService.CurrentTenant);

        modelBuilder.Entity<Schedule>()
            .HasMany(si => si.ScheduleRules);

        modelBuilder.Entity<ScheduleRule>()
            .HasOne(sr => sr.Group)
            .WithMany()
            .HasForeignKey(sr => sr.GroupId);

        // Define foreign key constraint between Child and Schedule without navigation properties
        modelBuilder.Entity<Schedule>()
            .HasOne<Child>()
            .WithMany()
            .HasForeignKey(s => s.ChildId);

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        foreach (var entry in ChangeTracker.Entries<IMustHaveTenant>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.TenantId = _tenantService.CurrentTenant;
                    break;
            }
        }

        // Remove DateTimeKind/UTC logic for DateOnly

        var result = await base.SaveChangesAsync(cancellationToken);
        return result;
    }
}
