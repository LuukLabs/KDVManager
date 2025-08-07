using KDVManager.Services.CRM.Application.Features.Children.Commands.AddChild;
using KDVManager.Services.CRM.Application.Features.Children.Commands.DeleteChild;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildDetail;
using KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild;
using KDVManager.Services.CRM.Application.Features.Children.Commands.ArchiveChild;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.CRM.Application.Contracts.Pagination;

public static class ChildrenEndpoints
{
    public static void MapChildrenEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/v1/children", async ([AsParameters] GetChildListQuery getChildListQuery, [FromServices] GetChildListQueryHandler handler, HttpResponse response) =>
        {
            var dtos = await handler.Handle(getChildListQuery);
            response.Headers.Append("x-Total", dtos.TotalCount.ToString());
            return Results.Ok(dtos);
        }).WithName("ListChildren").WithTags("children").Produces<PagedList<ChildListVM>>(StatusCodes.Status200OK);

        endpoints.MapGet("/v1/children/{id:guid}", async ([FromRoute] Guid id, [FromServices] GetChildDetailQueryHandler handler) =>
        {
            var query = new GetChildDetailQuery { Id = id };
            var dto = await handler.Handle(query);
            return Results.Ok(dto);
        }).WithName("GetChildById").WithTags("children").Produces<ChildDetailVM>(StatusCodes.Status200OK);

        endpoints.MapPost("/v1/children", async ([FromBody] AddChildCommand command, [FromServices] AddChildCommandHandler handler) =>
        {
            var id = await handler.Handle(command);
            return Results.Ok(id);
        }).WithName("AddChild").WithTags("children").Produces<Guid>(StatusCodes.Status200OK);

        endpoints.MapPut("/v1/children/{id:guid}", async ([FromRoute] Guid id, [FromBody] UpdateChildCommand command, [FromServices] UpdateChildCommandHandler handler) =>
        {
            command.Id = id;
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("UpdateChild").WithTags("children")
        .Produces(StatusCodes.Status204NoContent)
        .Produces<UnprocessableEntityResponse>(StatusCodes.Status422UnprocessableEntity);

        endpoints.MapDelete("/v1/children/{id:guid}", async ([FromRoute] Guid id, [FromServices] DeleteChildCommandHandler handler) =>
        {
            var command = new DeleteChildCommand { Id = id };
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("DeleteChild").WithTags("children").Produces(StatusCodes.Status204NoContent);

        endpoints.MapPost("/v1/children/{id:guid}/archive", async ([FromRoute] Guid id, [FromServices] ArchiveChildCommandHandler handler) =>
        {
            var command = new ArchiveChildCommand { Id = id };
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("ArchiveChild").WithTags("children").Produces(StatusCodes.Status204NoContent);
    }
}
