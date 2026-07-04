using KDVManager.IntegrationTests.Tenancy.Support;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Infrastructure;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Tenancy;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace KDVManager.IntegrationTests.Tenancy;

public class CrmTenantIsolationTests : IDisposable
{
    private readonly SqliteConnection _connection;

    public CrmTenantIsolationTests()
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

    private static Guardian NewGuardian() => new()
    {
        GivenName = "Given",
        FamilyName = "Family",
        DateOfBirth = new DateOnly(1990, 1, 1),
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
            contextA.Guardians.Add(NewGuardian());
            await contextA.SaveChangesAsync();
        }

        using (var contextB = CreateContext(Tenants.B))
        {
            Assert.Empty(await contextB.Guardians.ToListAsync());
        }

        using (var contextA = CreateContext(Tenants.A))
        {
            Assert.Single(await contextA.Guardians.ToListAsync());
        }
    }

    [Fact]
    public async Task InsertIsStampedWithCurrentTenantEvenWhenAnotherTenantWasSet()
    {
        using var context = CreateContext(Tenants.A);
        var guardian = NewGuardian();
        guardian.TenantId = Tenants.B;

        context.Guardians.Add(guardian);
        await context.SaveChangesAsync();

        Assert.Equal(Tenants.A, guardian.TenantId);
    }

    [Fact]
    public async Task ModifyingAnotherTenantsEntityFailsClosed()
    {
        Guid id;
        using (var contextA = CreateContext(Tenants.A))
        {
            var guardian = NewGuardian();
            contextA.Guardians.Add(guardian);
            await contextA.SaveChangesAsync();
            id = guardian.Id;
        }

        using var contextB = CreateContext(Tenants.B);
        var foreign = await contextB.Guardians.IgnoreQueryFilters().SingleAsync(g => g.Id == id);
        foreign.UpdateNames("Changed", "Name");

        await Assert.ThrowsAsync<TenantMismatchException>(() => contextB.SaveChangesAsync());
    }

    [Fact]
    public async Task DeletingAnotherTenantsEntityFailsClosed()
    {
        Guid id;
        using (var contextA = CreateContext(Tenants.A))
        {
            var guardian = NewGuardian();
            contextA.Guardians.Add(guardian);
            await contextA.SaveChangesAsync();
            id = guardian.Id;
        }

        using var contextB = CreateContext(Tenants.B);
        var foreign = await contextB.Guardians.IgnoreQueryFilters().SingleAsync(g => g.Id == id);
        contextB.Guardians.Remove(foreign);

        await Assert.ThrowsAsync<TenantMismatchException>(() => contextB.SaveChangesAsync());
    }

    [Fact]
    public async Task QueryingWithoutTenantContextFailsClosed()
    {
        using var context = CreateContext(null);
        await Assert.ThrowsAsync<TenantRequiredException>(() => context.Guardians.ToListAsync());
    }

    [Fact]
    public async Task SavingWithoutTenantContextFailsClosed()
    {
        using var context = CreateContext(null);
        context.Guardians.Add(NewGuardian());
        await Assert.ThrowsAsync<TenantRequiredException>(() => context.SaveChangesAsync());
    }
}
