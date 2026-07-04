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

        // No tenant could be resolved. If the caller is authenticated we must fail
        // closed: an authenticated principal without a tenant claim must never be
        // allowed to reach tenant-scoped resources. Anonymous requests (e.g. health
        // checks / openapi) are left to the authorization layer to accept or reject.
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            logger.LogWarning("Authenticated request without a tenant claim was rejected. Path: {Path}", context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"error\":\"Tenant context is required.\"}");
            return;
        }

        await _next(context);
    }
}
