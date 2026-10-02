using KDVManager.Services.Tenants.Application.Features.Tenants.Commands.AddTenant;
using KDVManager.Services.Tenants.Application.Features.Tenants.Commands.UpdateTenant;
using KDVManager.Services.Tenants.Application.Features.Tenants.Commands.ActivateTenant;
using KDVManager.Services.Tenants.Application.Features.Tenants.Commands.DeactivateTenant;
using KDVManager.Services.Tenants.Application.Features.Tenants.Queries.GetTenantList;
using KDVManager.Services.Tenants.Application.Features.Tenants.Queries.GetTenantDetail;
using KDVManager.Services.Tenants.Application.Contracts.Pagination;
using Microsoft.AspNetCore.Mvc;

public static class TenantsEndpoints
{
    public static void MapTenantsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/v1/tenants", async ([AsParameters] GetTenantListQuery getTenantListQuery, [FromServices] GetTenantListQueryHandler handler, HttpResponse response) =>
        {
            var dtos = await handler.Handle(getTenantListQuery);
            response.Headers.Append("x-Total", dtos.TotalCount.ToString());
            return Results.Ok(dtos);
        }).WithName("ListTenants").WithTags("tenants").Produces<PagedList<TenantListVM>>(StatusCodes.Status200OK);

        endpoints.MapGet("/v1/tenants/{id:guid}", async ([FromRoute] Guid id, [FromServices] GetTenantDetailQueryHandler handler) =>
        {
            var query = new GetTenantDetailQuery { Id = id };
            var dto = await handler.Handle(query);
            return Results.Ok(dto);
        }).WithName("GetTenantById").WithTags("tenants").Produces<TenantDetailVM>(StatusCodes.Status200OK);

        endpoints.MapPost("/v1/tenants", async ([FromBody] AddTenantCommand command, [FromServices] AddTenantCommandHandler handler) =>
        {
            var id = await handler.Handle(command);
            return Results.Ok(id);
        }).WithName("AddTenant").WithTags("tenants")
        .Produces<Guid>(StatusCodes.Status200OK)
        .Produces<UnprocessableEntityResponse>(StatusCodes.Status422UnprocessableEntity);

        endpoints.MapPut("/v1/tenants/{id:guid}", async ([FromRoute] Guid id, [FromBody] UpdateTenantCommand command, [FromServices] UpdateTenantCommandHandler handler) =>
        {
            command.Id = id;
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("UpdateTenant").WithTags("tenants")
        .Produces(StatusCodes.Status204NoContent)
        .Produces<UnprocessableEntityResponse>(StatusCodes.Status422UnprocessableEntity);

        endpoints.MapPost("/v1/tenants/{id:guid}/activate", async ([FromRoute] Guid id, [FromServices] ActivateTenantCommandHandler handler) =>
        {
            await handler.Handle(new ActivateTenantCommand { Id = id });
            return Results.NoContent();
        }).WithName("ActivateTenant").WithTags("tenants").Produces(StatusCodes.Status204NoContent);

        endpoints.MapPost("/v1/tenants/{id:guid}/deactivate", async ([FromRoute] Guid id, [FromServices] DeactivateTenantCommandHandler handler) =>
        {
            await handler.Handle(new DeactivateTenantCommand { Id = id });
            return Results.NoContent();
        }).WithName("DeactivateTenant").WithTags("tenants").Produces(StatusCodes.Status204NoContent);
    }
}
