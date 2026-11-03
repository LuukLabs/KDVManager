using KDVManager.Services.PlatformManagement.Application.Features.Tenants.Commands.CreateTenant;
using KDVManager.Services.PlatformManagement.Application.Features.Tenants.Commands.DeleteTenant;
using Microsoft.AspNetCore.Mvc;

public static class TenantsEndpoints
{
    public static void MapTenantsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/v1/tenants", async ([FromBody] CreateTenantCommand command, [FromServices] CreateTenantCommandHandler handler) =>
        {
            var id = await handler.Handle(command);
            return Results.Ok(id);
        }).WithName("CreateTenant").WithTags("tenants")
        .Produces<Guid>(StatusCodes.Status200OK)
        .Produces<UnprocessableEntityResponse>(StatusCodes.Status422UnprocessableEntity);

        endpoints.MapDelete("/v1/tenants/{id:guid}", async ([FromRoute] Guid id, [FromServices] DeleteTenantCommandHandler handler) =>
        {
            var command = new DeleteTenantCommand { Id = id };
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("DeleteTenant").WithTags("tenants").Produces(StatusCodes.Status204NoContent);
    }
}
