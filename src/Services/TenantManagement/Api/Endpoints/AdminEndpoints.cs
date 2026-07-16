using KDVManager.Services.TenantManagement.Application.Features.Admin;
using KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.ExtendTrial;
using KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.SetSubscription;
using KDVManager.Services.TenantManagement.Application.Features.Admin.Queries.ListTenants;
using Microsoft.AspNetCore.Mvc;

namespace KDVManager.Services.TenantManagement.Api.Endpoints;

/// <summary>
/// Cross-tenant platform-admin endpoints, gated by the PlatformAdmin policy (the
/// admin claim on the access token — see deploy/auth0/README.md).
/// </summary>
public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/v1/admin/tenants", async ([FromServices] ListTenantsQueryHandler handler) =>
        {
            var result = await handler.Handle(new ListTenantsQuery());
            return Results.Ok(result);
        })
        .WithName("AdminListTenants")
        .WithTags("admin")
        .Produces<IReadOnlyList<AdminTenantVM>>(StatusCodes.Status200OK)
        .RequireAuthorization(AuthorizationPolicies.PlatformAdmin);

        endpoints.MapPost("/v1/admin/tenants/{tenantId:guid}/extend-trial", async (
            Guid tenantId,
            [FromBody] ExtendTrialRequest request,
            [FromServices] ExtendTrialCommandHandler handler) =>
        {
            if (request.Days is < 1 or > 365)
                return Results.BadRequest(new { message = "Days must be between 1 and 365." });

            var result = await handler.Handle(new ExtendTrialCommand { TenantId = tenantId, Days = request.Days });
            return result is null ? Results.NotFound() : Results.Ok(result);
        })
        .WithName("AdminExtendTenantTrial")
        .WithTags("admin")
        .Produces<AdminTenantVM>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound)
        .RequireAuthorization(AuthorizationPolicies.PlatformAdmin);

        // Convert a tenant to a subscription (trial → real) or revert it to trial.
        endpoints.MapPut("/v1/admin/tenants/{tenantId:guid}/subscription", async (
            Guid tenantId,
            [FromBody] SetSubscriptionRequest request,
            [FromServices] SetSubscriptionCommandHandler handler) =>
        {
            var result = await handler.Handle(new SetSubscriptionCommand { TenantId = tenantId, Subscribed = request.Subscribed });
            return result is null ? Results.NotFound() : Results.Ok(result);
        })
        .WithName("AdminSetTenantSubscription")
        .WithTags("admin")
        .Produces<AdminTenantVM>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .RequireAuthorization(AuthorizationPolicies.PlatformAdmin);
    }

    /// <summary>Request body for extending a tenant's trial.</summary>
    public record ExtendTrialRequest(int Days);

    /// <summary>Request body for converting a tenant to/from a subscription.</summary>
    public record SetSubscriptionRequest(bool Subscribed);
}
