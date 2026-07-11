using KDVManager.IntegrationTests.Tenancy.Support;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Infrastructure;
using KDVManager.Services.Scheduling.Infrastructure.Repositories;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Tenancy;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace KDVManager.IntegrationTests.Tenancy;

public class SchedulingTenantIsolationTests : IDisposable
{
    private readonly SqliteConnection _connection;

    public SchedulingTenantIsolationTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        using var context = CreateContext(Tenants.A);
        context.Database.EnsureCreated();
    }

    public void Dispose() => _connection.Dispose();

    private ApplicationDbContext CreateContext(Guid? tenantId)
    {
        var accessor = new TenancyContextAccessor();
        if (tenantId is not null)
        {
            accessor.Current = new StaticTenancyContext(tenantId.Value);
        }

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        return new ApplicationDbContext(options, accessor);
    }

    private static Group NewGroup() => new()
    {
        Id = Guid.NewGuid(),
        Name = "Test group",
    };

    [Fact]
    public void EveryTenantOwnedEntityHasQueryFilterAndTenantIndex()
    {
        using var context = CreateContext(Tenants.A);
        TenancyModelAssertions.AssertTenantOwnedEntitiesAreGuarded(context.Model);
    }

    [Fact]
    public async Task EntitiesOfAnotherTenantAreInvisible()
    {
        using (var contextA = CreateContext(Tenants.A))
        {
            contextA.Groups.Add(NewGroup());
            await contextA.SaveChangesAsync();
        }

        using (var contextB = CreateContext(Tenants.B))
        {
            Assert.Empty(await contextB.Groups.ToListAsync());
        }

        using (var contextA = CreateContext(Tenants.A))
        {
            Assert.Single(await contextA.Groups.ToListAsync());
        }
    }

    [Fact]
    public async Task InsertIsStampedWithCurrentTenantEvenWhenAnotherTenantWasSet()
    {
        using var context = CreateContext(Tenants.A);
        var group = NewGroup();
        group.TenantId = Tenants.B;

        context.Groups.Add(group);
        await context.SaveChangesAsync();

        Assert.Equal(Tenants.A, group.TenantId);
    }

    [Fact]
    public async Task ModifyingAnotherTenantsEntityFailsClosed()
    {
        Guid id;
        using (var contextA = CreateContext(Tenants.A))
        {
            var group = NewGroup();
            contextA.Groups.Add(group);
            await contextA.SaveChangesAsync();
            id = group.Id;
        }

        using var contextB = CreateContext(Tenants.B);
        var foreign = await contextB.Groups.IgnoreQueryFilters().SingleAsync(g => g.Id == id);
        foreign.Name = "Changed";

        await Assert.ThrowsAsync<TenantMismatchException>(() => contextB.SaveChangesAsync());
    }

    [Fact]
    public async Task DeletingAnotherTenantsEntityFailsClosed()
    {
        Guid id;
        using (var contextA = CreateContext(Tenants.A))
        {
            var group = NewGroup();
            contextA.Groups.Add(group);
            await contextA.SaveChangesAsync();
            id = group.Id;
        }

        using var contextB = CreateContext(Tenants.B);
        var foreign = await contextB.Groups.IgnoreQueryFilters().SingleAsync(g => g.Id == id);
        contextB.Groups.Remove(foreign);

        await Assert.ThrowsAsync<TenantMismatchException>(() => contextB.SaveChangesAsync());
    }

    [Fact]
    public async Task QueryingWithoutTenantContextFailsClosed()
    {
        using var context = CreateContext(null);
        await Assert.ThrowsAsync<TenantRequiredException>(() => context.Groups.ToListAsync());
    }

    [Fact]
    public async Task SavingWithoutTenantContextFailsClosed()
    {
        using var context = CreateContext(null);
        context.Groups.Add(NewGroup());
        await Assert.ThrowsAsync<TenantRequiredException>(() => context.SaveChangesAsync());
    }

    [Fact]
    public async Task ReplacingScheduleRulesRecalculatesTheTimelineInTheSameUnitOfWork()
    {
        var childId = Guid.NewGuid();
        var groupId = Guid.NewGuid();
        var timeSlotId = Guid.NewGuid();
        var firstScheduleId = Guid.NewGuid();

        using (var context = CreateContext(Tenants.A))
        {
            context.Children.Add(new Child
            {
                Id = childId,
                GivenName = "Test",
                FamilyName = "Child",
                DateOfBirth = new DateOnly(2020, 1, 1)
            });
            context.Groups.Add(new Group { Id = groupId, Name = "Test group" });
            context.TimeSlots.Add(new TimeSlot
            {
                Id = timeSlotId,
                Name = "Morning",
                StartTime = new TimeOnly(8, 0),
                EndTime = new TimeOnly(12, 0)
            });
            context.Schedules.AddRange(
                new Schedule
                {
                    Id = firstScheduleId,
                    ChildId = childId,
                    StartDate = new DateOnly(2026, 1, 1),
                    ScheduleRules = new List<ScheduleRule>
                    {
                        new()
                        {
                            Id = Guid.NewGuid(),
                            Day = DayOfWeek.Monday,
                            TimeSlotId = timeSlotId,
                            GroupId = groupId
                        }
                    }
                },
                new Schedule
                {
                    Id = Guid.NewGuid(),
                    ChildId = childId,
                    StartDate = new DateOnly(2026, 2, 1),
                    ScheduleRules = new List<ScheduleRule>
                    {
                        new()
                        {
                            Id = Guid.NewGuid(),
                            Day = DayOfWeek.Tuesday,
                            TimeSlotId = timeSlotId,
                            GroupId = groupId
                        }
                    }
                });
            await context.SaveChangesAsync();
        }

        using (var context = CreateContext(Tenants.A))
        {
            var repository = new ScheduleRepository(context);
            var schedule = await repository.GetWithRulesByIdAsync(firstScheduleId);
            Assert.NotNull(schedule);

            schedule!.StartDate = new DateOnly(2026, 1, 15);
            await repository.ReplaceRulesAndRecalculateAsync(schedule, new List<ScheduleRule>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ScheduleId = schedule.Id,
                    Day = DayOfWeek.Sunday,
                    TimeSlotId = timeSlotId,
                    GroupId = groupId
                }
            });
        }

        using (var context = CreateContext(Tenants.A))
        {
            var schedule = await context.Schedules
                .Include(item => item.ScheduleRules)
                .SingleAsync(item => item.Id == firstScheduleId);

            Assert.Equal(new DateOnly(2026, 1, 15), schedule.StartDate);
            Assert.Equal(new DateOnly(2026, 1, 31), schedule.EndDate);
            var rule = Assert.Single(schedule.ScheduleRules);
            Assert.Equal(DayOfWeek.Sunday, rule.Day);
        }
    }
}
