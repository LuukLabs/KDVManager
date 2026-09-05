using KDVManager.Services.CRM.Application.Features.Waitlist;
using Microsoft.AspNetCore.Mvc;

namespace KDVManager.Services.CRM.Api.Endpoints;

public static class WaitlistEndpoints
{
    public static void MapWaitlistEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/v1/waitlist", async ([AsParameters] GetWaitlistEntriesQuery query, [FromServices] GetWaitlistEntriesQueryHandler handler) =>
        {
            return Results.Ok(await handler.Handle(query));
        }).WithName("ListWaitlistEntries").WithTags("waitlist").Produces<IReadOnlyList<WaitlistEntryVM>>();

        endpoints.MapPost("/v1/waitlist", async ([FromBody] CreateWaitlistEntryCommand command, [FromServices] CreateWaitlistEntryCommandHandler handler) =>
        {
            return Results.Ok(await handler.Handle(command));
        }).WithName("CreateWaitlistEntry").WithTags("waitlist")
          .Produces<Guid>(StatusCodes.Status200OK)
          .Produces<UnprocessableEntityResponse>(StatusCodes.Status422UnprocessableEntity);

        endpoints.MapPut("/v1/waitlist/{id:guid}/status", async ([FromRoute] Guid id, [FromBody] UpdateWaitlistEntryStatusCommand command, [FromServices] UpdateWaitlistEntryStatusCommandHandler handler) =>
        {
            await handler.Handle(id, command);
            return Results.NoContent();
        }).WithName("UpdateWaitlistEntryStatus").WithTags("waitlist").Produces(StatusCodes.Status204NoContent);
    }
}
