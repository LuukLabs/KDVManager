using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Services.CRM.Application.Features.People.Commands.AddPerson;
using KDVManager.Services.CRM.Application.Features.People.Queries.GetPersonList;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

public static class PeopleEndpoints
{
    public static void MapPeopleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/v1/people", async (GetPersonListQuery getPersonListQuery, GetPersonListQueryHandler handler, HttpResponse response) =>
        {
            var dtos = await handler.Handle(getPersonListQuery);
            response.Headers.Append("x-Total", dtos.TotalCount.ToString());
            return Results.Ok(dtos);
        });

        endpoints.MapPost("/v1/people", async (AddPersonCommand command, AddPersonCommandHandler handler) =>
        {
            var id = await handler.Handle(command);
            return Results.Ok(id);
        });
    }
}
