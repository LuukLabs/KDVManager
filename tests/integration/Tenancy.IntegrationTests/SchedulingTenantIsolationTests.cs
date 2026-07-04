using KDVManager.IntegrationTests.Tenancy.Support;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Infrastructure;
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
}
