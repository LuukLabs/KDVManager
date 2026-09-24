using System;
using System.Text.Json;
using System.Threading.Tasks;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Contracts.Trial;
using KDVManager.Shared.Infrastructure.Tenancy;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace KDVManager.Shared.Infrastructure.Trial;

/// <summary>
/// Rejects requests for tenants whose 30-day trial has expired with an HTTP 402
/// (Payment Required) response. Infrastructure endpoints and the trial-status
/// endpoint stay reachable so the frontend can still surface the trial state.
/// Requests without a resolved tenant (anonymous, health checks) pass through.
/// </summary>
public class TrialEnforcementMiddleware
{
    private static readonly string[] BypassPrefixes =
    {
        "/healthz",
        "/openapi",
        "/swagger",
        "/v1/trial-status",
    };

    private readonly RequestDelegate _next;

    public TrialEnforcementMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ITenancyContextAccessor tenancyContextAccessor,
        ITrialStatusService trialStatusService,
        ILogger<TrialEnforcementMiddleware> logger)
    {
        // No tenant resolved => nothing tenant-scoped to enforce. The accessor
        // throws TenantRequiredException (rather than returning null) when unset.
        Guid tenantId;
        try
        {
            tenantId = tenancyContextAccessor.Current!.TenantId;
        }
        catch (TenantRequiredException)
        {
            await _next(context);
            return;
        }

        var path = context.Request.Path.Value ?? string.Empty;
        foreach (var prefix in BypassPrefixes)
        {
            if (path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }
        }

        var status = await trialStatusService.GetTrialStatusAsync(context.RequestAborted);
        if (status.IsExpired)
        {
            logger.LogInformation(
                "Blocking request for tenant {TenantId}: trial expired on {TrialEndDate:o}",
                tenantId,
                status.TrialEndDate);

            context.Response.StatusCode = StatusCodes.Status402PaymentRequired;
            context.Response.ContentType = "application/json";

            var payload = JsonSerializer.Serialize(new
            {
                code = "trial_expired",
                message = "Your 30-day trial has ended. Please subscribe to continue using KDVManager.",
                trialStartDate = status.TrialStartDate,
                trialEndDate = status.TrialEndDate,
            });

            await context.Response.WriteAsync(payload, context.RequestAborted);
            return;
        }

        await _next(context);
    }
}
