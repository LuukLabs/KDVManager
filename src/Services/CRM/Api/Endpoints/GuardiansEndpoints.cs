using KDVManager.Services.CRM.Application.Features.Guardians.Commands.AddGuardian;
using KDVManager.Services.CRM.Application.Features.Guardians.Commands.UpdateGuardian;
using KDVManager.Services.CRM.Application.Features.Guardians.Commands.DeleteGuardian;
using KDVManager.Services.CRM.Application.Features.Guardians.Commands.LinkGuardianToChild;
using KDVManager.Services.CRM.Application.Features.Guardians.Commands.UnlinkGuardianFromChild;
using KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianList;
using KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianDetail;
using KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetChildGuardians;
using KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianChildren;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace KDVManager.Services.CRM.Api.Endpoints;

public static class GuardiansEndpoints
{
    public static void MapGuardiansEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/v1/guardians", async ([AsParameters] GetGuardianListQuery query, [FromServices] GetGuardianListQueryHandler handler, HttpResponse response) =>
        {
            var result = await handler.Handle(query);
            response.Headers.Append("x-Total", result.TotalCount.ToString());
            return Results.Ok(result);
        }).WithName("ListGuardians").WithTags("guardians").Produces<PagedList<GuardianListVM>>(StatusCodes.Status200OK);

        endpoints.MapGet("/v1/guardians/{id:guid}", async ([FromRoute] Guid id, [FromServices] GetGuardianDetailQueryHandler handler) =>
        {
            var query = new GetGuardianDetailQuery { Id = id };
            var result = await handler.Handle(query);
            return Results.Ok(result);
        }).WithName("GetGuardianById").WithTags("guardians").Produces<GuardianDetailVM>(StatusCodes.Status200OK);

        endpoints.MapPost("/v1/guardians", async ([FromBody] AddGuardianCommand command, [FromServices] AddGuardianCommandHandler handler) =>
        {
            var id = await handler.Handle(command);
            return Results.Ok(id);
        }).WithName("AddGuardian").WithTags("guardians")
        .Produces<Guid>(StatusCodes.Status200OK);

        endpoints.MapPut("/v1/guardians/{id:guid}", async ([FromRoute] Guid id, [FromBody] UpdateGuardianCommand command, [FromServices] UpdateGuardianCommandHandler handler) =>
        {
            command.Id = id;
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("UpdateGuardian").WithTags("guardians")
        .Produces(StatusCodes.Status204NoContent);

        endpoints.MapDelete("/v1/guardians/{id:guid}", async ([FromRoute] Guid id, [FromServices] DeleteGuardianCommandHandler handler) =>
        {
            var command = new DeleteGuardianCommand { Id = id };
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("DeleteGuardian").WithTags("guardians").Produces(StatusCodes.Status204NoContent);

        // Guardian-Children relationship endpoint
        endpoints.MapGet("/v1/guardians/{guardianId:guid}/children", async ([FromRoute] Guid guardianId, [FromServices] GetGuardianChildrenQueryHandler handler) =>
        {
            var query = new GetGuardianChildrenQuery { GuardianId = guardianId };
            var result = await handler.Handle(query);
            return Results.Ok(result);
        }).WithName("GetGuardianChildren").WithTags("guardians").Produces<List<GuardianChildVM>>(StatusCodes.Status200OK);

        // Child-Guardian relationship endpoints
        endpoints.MapGet("/v1/children/{childId:guid}/guardians", async ([FromRoute] Guid childId, [FromServices] GetChildGuardiansQueryHandler handler) =>
        {
            var query = new GetChildGuardiansQuery { ChildId = childId };
            var result = await handler.Handle(query);
            return Results.Ok(result);
        }).WithName("GetChildGuardians").WithTags("guardians").Produces<List<ChildGuardianVM>>(StatusCodes.Status200OK);

        endpoints.MapPost("/v1/children/{childId:guid}/guardians/{guardianId:guid}", async ([FromRoute] Guid childId, [FromRoute] Guid guardianId, [FromBody] LinkGuardianToChildRequest request, [FromServices] LinkGuardianToChildCommandHandler handler) =>
        {
            var command = new LinkGuardianToChildCommand
            {
                ChildId = childId,
                GuardianId = guardianId,
                RelationshipType = request.RelationshipType,
                IsPrimaryContact = request.IsPrimaryContact,
                IsEmergencyContact = request.IsEmergencyContact
            };
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("LinkGuardianToChild").WithTags("guardians")
        .Produces(StatusCodes.Status204NoContent);

        endpoints.MapDelete("/v1/children/{childId:guid}/guardians/{guardianId:guid}", async ([FromRoute] Guid childId, [FromRoute] Guid guardianId, [FromServices] UnlinkGuardianFromChildCommandHandler handler) =>
        {
            var command = new UnlinkGuardianFromChildCommand { ChildId = childId, GuardianId = guardianId };
            await handler.Handle(command);
            return Results.NoContent();
        }).WithName("UnlinkGuardianFromChild").WithTags("guardians").Produces(StatusCodes.Status204NoContent);
    }
}

public class LinkGuardianToChildRequest
{
    public GuardianRelationshipType RelationshipType { get; set; }
    public bool IsPrimaryContact { get; set; }
    public bool IsEmergencyContact { get; set; }
}
