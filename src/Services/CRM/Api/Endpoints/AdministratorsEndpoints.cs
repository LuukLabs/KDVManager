using KDVManager.Services.CRM.Application.Features.Administrators.Commands.CreateAdministrator;
using KDVManager.Services.CRM.Application.Features.Administrators.Commands.DeleteAdministrator;
using KDVManager.Services.CRM.Application.Features.Administrators.Queries.GetAdministratorList;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace KDVManager.Services.CRM.Api.Endpoints;

public static class AdministratorsEndpoints
{
    public static void MapAdministratorsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/v1/administrators", async ([AsParameters] GetAdministratorListQuery query, [FromServices] GetAdministratorListQueryHandler handler, HttpResponse response) =>
        {
            var result = await handler.Handle(query);
            response.Headers.Append("x-Total", result.TotalCount.ToString());
            return Results.Ok(result);
        }).WithName("ListAdministrators").WithTags("administrators").Produces<PagedList<AdministratorListVM>>(StatusCodes.Status200OK);

        endpoints.MapPost("/v1/administrators", async ([FromBody] CreateAdministratorCommand command, [FromServices] CreateAdministratorCommandHandler handler) =>
        {
            var id = await handler.Handle(command);
            return Results.Ok(id);
        }).WithName("CreateAdministrator").WithTags("administrators")
        .Produces<Guid>(StatusCodes.Status200OK);

        endpoints.MapDelete("/v1/administrators/{id:guid}", async ([FromRoute] Guid id, [FromServices] DeleteAdministratorCommandHandler handler) =>
        {
            var command = new DeleteAdministratorCommand { Id = id };
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("DeleteAdministrator").WithTags("administrators").Produces(StatusCodes.Status204NoContent);
    }
}
