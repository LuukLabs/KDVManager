using KDVManager.Shared.Contracts.Trial;
using Microsoft.AspNetCore.Mvc;

public static class TrialEndpoints
{
    public static void MapTrialEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/v1/trial-status", async ([FromServices] ITrialStatusService trialStatusService) =>
        {
            var status = await trialStatusService.GetTrialStatusAsync();
            return Results.Ok(status);
        }).WithName("GetTrialStatus").WithTags("trial").Produces<TrialStatus>(StatusCodes.Status200OK);
    }
}
