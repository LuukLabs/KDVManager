using System.Collections.Generic;
using KDVManager.Services.CRM.Application.Features.Administrators.Commands.DeleteAdministrator;
using KDVManager.Services.CRM.Application.Features.Administrators.Commands.InviteAdministrator;
using KDVManager.Services.CRM.Application.Features.Administrators.Commands.RevokeInvitation;
using KDVManager.Services.CRM.Application.Features.Administrators.Queries.GetAdministratorList;
using Microsoft.AspNetCore.Mvc;

namespace KDVManager.Services.CRM.Api.Endpoints;

public static class AdministratorsEndpoints
{
    public static void MapAdministratorsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/v1/administrators", async ([FromServices] GetAdministratorListQueryHandler handler) =>
        {
            var result = await handler.Handle(new GetAdministratorListQuery());
            return Results.Ok(result);
        }).WithName("ListAdministrators").WithTags("administrators")
        .Produces<List<AdministratorListVM>>(StatusCodes.Status200OK);

        endpoints.MapPost("/v1/administrators/invitations", async ([FromBody] InviteAdministratorCommand command, [FromServices] InviteAdministratorCommandHandler handler) =>
        {
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("InviteAdministrator").WithTags("administrators")
        .Produces(StatusCodes.Status204NoContent);

        endpoints.MapDelete("/v1/administrators/{userId}", async ([FromRoute] string userId, [FromServices] DeleteAdministratorCommandHandler handler) =>
        {
            await handler.Handle(new DeleteAdministratorCommand { UserId = userId });
            return Results.NoContent();
        }).WithName("DeleteAdministrator").WithTags("administrators")
        .Produces(StatusCodes.Status204NoContent);

        endpoints.MapDelete("/v1/administrators/invitations/{invitationId}", async ([FromRoute] string invitationId, [FromServices] RevokeInvitationCommandHandler handler) =>
        {
            await handler.Handle(new RevokeInvitationCommand { InvitationId = invitationId });
            return Results.NoContent();
        }).WithName("RevokeInvitation").WithTags("administrators")
        .Produces(StatusCodes.Status204NoContent);
    }
}
