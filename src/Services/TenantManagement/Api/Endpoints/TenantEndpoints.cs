using KDVManager.Services.TenantManagement.Application.Features.Tenants;
using KDVManager.Services.TenantManagement.Application.Features.Tenants.Commands.ProvisionTenant;
using KDVManager.Services.TenantManagement.Application.Features.Tenants.Queries.GetMyTenant;
using Microsoft.AspNetCore.Mvc;

namespace KDVManager.Services.TenantManagement.Api.Endpoints;

public static class TenantEndpoints
{
    public static void MapTenantEndpoints(this IEndpointRouteBuilder endpoints)
    {
        // Current user's tenant. 404 signals the web app to start onboarding.
        endpoints.MapGet("/v1/tenants/me", async ([FromServices] GetMyTenantQueryHandler handler) =>
        {
            var result = await handler.Handle(new GetMyTenantQuery());
            return result is null ? Results.NotFound() : Results.Ok(result);
        })
        .WithName("GetMyTenant")
        .WithTags("tenants")
        .Produces<TenantVM>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .RequireAuthorization();

        // Provision a tenant for the current user. Authenticated by identity (sub);
        // does not require a tenant claim (the user has none yet during onboarding).
        endpoints.MapPost("/v1/tenants", async ([FromBody] ProvisionTenantCommand command, [FromServices] ProvisionTenantCommandHandler handler) =>
        {
            if (string.IsNullOrWhiteSpace(command.Name))
                return Results.BadRequest(new { message = "Organization name is required." });

            var result = await handler.Handle(command);
            return Results.Ok(result);
        })
        .WithName("ProvisionTenant")
        .WithTags("tenants")
        .Produces<TenantVM>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .RequireAuthorization();
    }
}
