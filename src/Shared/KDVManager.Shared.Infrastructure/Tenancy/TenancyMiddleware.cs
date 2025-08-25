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
        Console.WriteLine($"[TenancyMiddleware] Processing request: {context.Request.Method} {context.Request.Path}");

        var resolver = serviceProvider.GetRequiredService<ITenancyResolver>();
        Console.WriteLine($"[TenancyMiddleware] Using resolver: {resolver.GetType().Name}");

        var tenantContext = resolver.Resolve();
        if (tenantContext != null)
        {
            Console.WriteLine($"[TenancyMiddleware] Tenant context resolved: {tenantContext.TenantId}");
            accessor.Current = tenantContext;
        }
        else
        {
            Console.WriteLine("[TenancyMiddleware] No tenant context resolved - accessor.Current will remain null");
        }

        await _next(context);
    }
}
