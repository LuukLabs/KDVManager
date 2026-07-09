using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Threading;
using System.Reflection;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Tenancy;
using System;

namespace KDVManager.Services.Scheduling.Infrastructure;

public class ApplicationDbContext : DbContext
{
    private readonly ITenancyContextAccessor _tenancyContextAccessor;
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenancyContextAccessor tenancyContextAccessor) : base(options)
    {
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    public DbSet<Group> Groups { get; set; }
    public DbSet<TimeSlot> TimeSlots { get; set; }
    public DbSet<Schedule> Schedules { get; set; }
    public DbSet<ScheduleRule> ScheduleRules { get; set; }
    public DbSet<Child> Children { get; set; }
    public DbSet<Absence> Absences { get; set; }
    public DbSet<AttendanceRecord> AttendanceRecords { get; set; }
    public DbSet<AttendanceAuditEntry> AttendanceAuditEntries { get; set; }
    public DbSet<ClosurePeriod> ClosurePeriods { get; set; }
    public DbSet<EndMark> EndMarks { get; set; }
    public DbSet<EndMarkSettings> EndMarkSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Child>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<Group>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<TimeSlot>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<ScheduleRule>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<Schedule>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<Absence>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<AttendanceRecord>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<AttendanceAuditEntry>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<ClosurePeriod>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<EndMark>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);
        modelBuilder.Entity<EndMarkSettings>().HasQueryFilter(a => a.TenantId == _tenancyContextAccessor.Current!.TenantId);

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

        modelBuilder.Entity<Absence>()
            .HasOne<Child>()
            .WithMany()
            .HasForeignKey(a => a.ChildId);
        modelBuilder.Entity<AttendanceRecord>().HasIndex(a => new { a.TenantId, a.ChildId, a.Date }).IsUnique();
        modelBuilder.Entity<AttendanceAuditEntry>().HasIndex(a => new { a.TenantId, a.AttendanceRecordId, a.OccurredAt });

        modelBuilder.Entity<ClosurePeriod>().HasIndex(cd => cd.StartDate);
        modelBuilder.Entity<ClosurePeriod>().HasIndex(cd => cd.EndDate);

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        modelBuilder.ApplyTenantIndexes();
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ChangeTracker.EnforceTenancy(_tenancyContextAccessor);
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        ChangeTracker.EnforceTenancy(_tenancyContextAccessor);
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }
}
