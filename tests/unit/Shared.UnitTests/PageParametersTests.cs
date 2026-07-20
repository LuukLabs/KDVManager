using KDVManager.Shared.Application.Contracts.Pagination;
using Xunit;

namespace KDVManager.UnitTests.Shared;

public class PageParametersTests
{
    private sealed class TestPageParameters : PageParameters;

    [Fact]
    public void Defaults_to_first_page_of_25()
    {
        var parameters = new TestPageParameters();

        Assert.Equal(1, parameters.PageNumber);
        Assert.Equal(25, parameters.PageSize);
    }

    [Fact]
    public void PageSize_is_clamped_to_100()
    {
        var parameters = new TestPageParameters { PageSize = 500 };

        Assert.Equal(100, parameters.PageSize);
    }

    [Fact]
    public void PageSize_below_the_maximum_is_kept()
    {
        var parameters = new TestPageParameters { PageSize = 42 };

        Assert.Equal(42, parameters.PageSize);
    }
}
