using KDVManager.Services.CRM.Application.Features.Children.Commands.AddChild;
using KDVManager.Services.CRM.Application.Features.Children.Commands.DeleteChild;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildDetail;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetNextChildNumber;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetPhoneList;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetNewsletterRecipients;
using KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild;
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
        }).WithName("AddChild").WithTags("children")
        .Produces<Guid>(StatusCodes.Status200OK)
        .Produces<UnprocessableEntityResponse>(StatusCodes.Status422UnprocessableEntity);

        endpoints.MapPut("/v1/children/{id:guid}", async ([FromRoute] Guid id, [FromBody] UpdateChildCommand command, [FromServices] UpdateChildCommandHandler handler) =>
        {
            command.Id = id;
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("UpdateChild").WithTags("children")
        .Produces(StatusCodes.Status204NoContent)
        .Produces<UnprocessableEntityResponse>(StatusCodes.Status422UnprocessableEntity);

        endpoints.MapGet("/v1/children/next-number", async ([FromServices] GetNextChildNumberQueryHandler handler) =>
        {
            var query = new GetNextChildNumberQuery();
            var nextNumber = await handler.Handle(query);
            return Results.Ok(nextNumber);
        }).WithName("GetNextChildNumber").WithTags("children").Produces<int>(StatusCodes.Status200OK);

        endpoints.MapDelete("/v1/children/{id:guid}", async ([FromRoute] Guid id, [FromServices] DeleteChildCommandHandler handler) =>
        {
            var command = new DeleteChildCommand { Id = id };
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("DeleteChild").WithTags("children").Produces(StatusCodes.Status204NoContent);

        endpoints.MapGet("/v1/children/phone-list", async ([AsParameters] GetPhoneListQuery query, [FromServices] GetPhoneListQueryHandler handler) =>
        {
            var response = await handler.Handle(query);
            return Results.Ok(response);
        }).WithName("GetPhoneList").WithTags("children").Produces<PhoneListResponse>(StatusCodes.Status200OK);

        endpoints.MapGet("/v1/children/newsletter-recipients", async ([AsParameters] GetNewsletterRecipientsQuery query, [FromServices] GetNewsletterRecipientsQueryHandler handler) =>
        {
            var response = await handler.Handle(query);
            return Results.Ok(response);
        }).WithName("GetNewsletterRecipients").WithTags("children").Produces<NewsletterRecipientsResponse>(StatusCodes.Status200OK);
    }
}
