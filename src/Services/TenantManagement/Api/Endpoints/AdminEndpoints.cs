using KDVManager.Services.TenantManagement.Application.Features.Admin;
using KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.DeleteTenant;
using KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.ExtendTrial;
using KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.SetSubscription;
using KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.UpdateTenant;
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

        // Change a tenant's organization details (name, invoice address).
        endpoints.MapPut("/v1/admin/tenants/{tenantId:guid}", async (
            Guid tenantId,
            [FromBody] UpdateTenantRequest request,
            [FromServices] UpdateTenantCommandHandler handler) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new { message = "Name is required." });
            if (request.Name.Trim().Length > 200)
                return Results.BadRequest(new { message = "Name must be at most 200 characters." });
            if (request.InvoiceAddress is { Length: > 500 })
                return Results.BadRequest(new { message = "Invoice address must be at most 500 characters." });

            var result = await handler.Handle(new UpdateTenantCommand
            {
                TenantId = tenantId,
                Name = request.Name,
                InvoiceAddress = request.InvoiceAddress,
            });
            return result is null ? Results.NotFound() : Results.Ok(result);
        })
        .WithName("AdminUpdateTenant")
        .WithTags("admin")
        .Produces<AdminTenantVM>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound)
        .RequireAuthorization(AuthorizationPolicies.PlatformAdmin);

        // Delete a tenant. Publishes TenantDeletedEvent so read models follow.
        endpoints.MapDelete("/v1/admin/tenants/{tenantId:guid}", async (
            Guid tenantId,
            [FromServices] DeleteTenantCommandHandler handler) =>
        {
            var deleted = await handler.Handle(new DeleteTenantCommand { TenantId = tenantId });
            return deleted ? Results.NoContent() : Results.NotFound();
        })
        .WithName("AdminDeleteTenant")
        .WithTags("admin")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .RequireAuthorization(AuthorizationPolicies.PlatformAdmin);
    }

    /// <summary>Request body for extending a tenant's trial.</summary>
    public record ExtendTrialRequest(int Days);

    /// <summary>Request body for converting a tenant to/from a subscription.</summary>
    public record SetSubscriptionRequest(bool Subscribed);

    /// <summary>Request body for changing a tenant's organization details.</summary>
    public record UpdateTenantRequest(string Name, string? InvoiceAddress);
}
