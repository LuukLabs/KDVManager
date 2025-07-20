// File: KDVManager.Shared.Infrastructure/Tenancy/TenancyMiddleware.cs
using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public class TenancyMiddleware
{
    private readonly RequestDelegate _next;

    public TenancyMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenancyContextAccessor accessor, IServiceProvider serviceProvider)
    {
        var resolver = serviceProvider.GetRequiredService<ITenancyResolver>();
        var tenantContext = resolver.Resolve();
        if (tenantContext != null)
        {
            accessor.Current = tenantContext;
        }

        await _next(context);
    }
}
