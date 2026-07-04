using KDVManager.IntegrationTests.Tenancy.Support;
using KDVManager.Shared.Infrastructure.Tenancy;
using Xunit;

namespace KDVManager.IntegrationTests.Tenancy;

public class TenancyContextAccessorTests
{
    [Fact]
    public void ReadingCurrentWithoutTenantFailsClosed()
    {
        var accessor = new TenancyContextAccessor();

        Assert.False(accessor.HasTenant);
        Assert.Throws<TenantRequiredException>(() => accessor.Current);
    }

    [Fact]
    public void ReadingCurrentAfterSettingTenantReturnsIt()
    {
        var accessor = new TenancyContextAccessor
        {
            Current = new StaticTenancyContext(Tenants.A),
        };

        Assert.True(accessor.HasTenant);
        Assert.Equal(Tenants.A, accessor.Current!.TenantId);
    }
}
