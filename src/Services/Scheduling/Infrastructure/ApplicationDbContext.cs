using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Group>().HasQueryFilter(a => a.TenantId == _tenantService.Tenant);
        modelBuilder.Entity<TimeSlot>().HasQueryFilter(a => a.TenantId == _tenantService.Tenant);
        modelBuilder.Entity<ScheduleRule>().HasQueryFilter(a => a.TenantId == _tenantService.Tenant);
        modelBuilder.Entity<Schedule>().HasQueryFilter(a => a.TenantId == _tenantService.Tenant).HasMany(si => si.ScheduleRules);

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
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

        // Ensure all DateTime properties are UTC before saving
        foreach (var entry in ChangeTracker.Entries<Schedule>())
        {
            if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
            {
                if (entry.Entity.StartDate.Kind != DateTimeKind.Utc)
                {
                    entry.Entity.StartDate = DateTime.SpecifyKind(entry.Entity.StartDate, DateTimeKind.Utc);
                }
                if (entry.Entity.EndDate.HasValue && entry.Entity.EndDate.Value.Kind != DateTimeKind.Utc)
                {
                    entry.Entity.EndDate = DateTime.SpecifyKind(entry.Entity.EndDate.Value, DateTimeKind.Utc);
                }
            }
        }

        var result = await base.SaveChangesAsync(cancellationToken);
        return result;
    }
}
