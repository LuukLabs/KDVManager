// File: KDVManager.Shared.Infrastructure/Tenancy/TenancyMiddleware.cs
using System.Diagnostics;
using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public class TenancyMiddleware
{
    private readonly RequestDelegate _next;

    public TenancyMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenancyContextAccessor accessor, IServiceProvider serviceProvider, ILogger<TenancyMiddleware> logger)
    {
        var resolver = serviceProvider.GetRequiredService<ITenancyResolver>();
        var tenantContext = resolver.Resolve();
        if (tenantContext != null)
        {
            accessor.Current = tenantContext;

            // Also set tenant information on the current Activity/span for immediate propagation
            var currentActivity = Activity.Current;
            if (currentActivity != null)
            {
                currentActivity.SetTag("tenant.id", tenantContext.TenantId.ToString());
            }
            using (logger.BeginScope(new Dictionary<string, object>
                   {
                       {"tenant.id", tenantContext.TenantId }
                   }))
            {
                await _next(context);
                return;
            }
        }

        await _next(context);
    }
}
