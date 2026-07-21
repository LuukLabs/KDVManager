using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Persistence;

namespace KDVManager.Services.Scheduling.Infrastructure;

public class ApplicationDbContext : TenantDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenancyContextAccessor tenancyContextAccessor) : base(options, tenancyContextAccessor)
    {
    }

    public DbSet<Group> Groups { get; set; }
    public DbSet<TimeSlot> TimeSlots { get; set; }
    public DbSet<Schedule> Schedules { get; set; }
    public DbSet<ScheduleRule> ScheduleRules { get; set; }
    public DbSet<Child> Children { get; set; }
    public DbSet<Absence> Absences { get; set; }
    public DbSet<ClosurePeriod> ClosurePeriods { get; set; }
    public DbSet<EndMark> EndMarks { get; set; }
    public DbSet<EndMarkSettings> EndMarkSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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

        modelBuilder.Entity<ClosurePeriod>().HasIndex(cd => cd.StartDate);
        modelBuilder.Entity<ClosurePeriod>().HasIndex(cd => cd.EndDate);

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        ApplyTenancy(modelBuilder);
    }
}
