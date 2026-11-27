using KDVManager.Services.CRM.Application.Features.Waitlist;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace KDVManager.Services.CRM.Api.Endpoints;

public static class WaitlistEndpoints
{
    public static void MapWaitlistEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/v1/waitlist", async ([AsParameters] GetWaitlistEntriesQuery query, [FromServices] GetWaitlistEntriesQueryHandler handler) =>
        {
            return Results.Ok(await handler.Handle(query));
        }).WithName("ListWaitlistEntries").WithTags("waitlist").Produces<IReadOnlyList<WaitlistEntryVM>>();

        endpoints.MapGet("/v1/waitlist/{id:guid}", async (Guid id, GetWaitlistEntryQueryHandler handler) =>
            Results.Ok(await handler.Handle(id)))
            .WithName("GetWaitlistEntry").WithTags("waitlist").Produces<WaitlistEntryVM>().Produces(StatusCodes.Status404NotFound);

        endpoints.MapPut("/v1/waitlist/{id:guid}", async (Guid id, UpdateWaitlistEntryCommand command, UpdateWaitlistEntryCommandHandler handler) =>
        {
            await handler.Handle(id, command);
            return Results.NoContent();
        }).WithName("UpdateWaitlistEntry").WithTags("waitlist").Produces(StatusCodes.Status204NoContent)
            .Produces<UnprocessableEntityResponse>(StatusCodes.Status422UnprocessableEntity)
            .Produces(StatusCodes.Status404NotFound).Produces(StatusCodes.Status409Conflict);

        endpoints.MapPost("/v1/waitlist", async ([FromBody] CreateWaitlistEntryCommand command, [FromServices] CreateWaitlistEntryCommandHandler handler) =>
        {
            return Results.Ok(await handler.Handle(command));
        }).WithName("CreateWaitlistEntry").WithTags("waitlist")
          .Produces<Guid>(StatusCodes.Status200OK)
          .Produces<UnprocessableEntityResponse>(StatusCodes.Status422UnprocessableEntity);

        endpoints.MapPut("/v1/waitlist/{id:guid}/status", async ([FromRoute] Guid id, [FromBody] UpdateWaitlistEntryStatusCommand command, [FromServices] UpdateWaitlistEntryStatusCommandHandler handler, ClaimsPrincipal user) =>
        {
            var actor = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
            if (string.IsNullOrWhiteSpace(actor) || actor.Length > 255) return Results.Forbid();
            await handler.Handle(id, command, actor);
            return Results.NoContent();
        }).WithName("UpdateWaitlistEntryStatus").WithTags("waitlist").Produces(StatusCodes.Status204NoContent)
            .Produces<UnprocessableEntityResponse>(StatusCodes.Status422UnprocessableEntity)
            .Produces(StatusCodes.Status403Forbidden).Produces(StatusCodes.Status404NotFound).Produces(StatusCodes.Status409Conflict);
    }
}
