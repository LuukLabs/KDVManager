using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Features.Overview.Queries.GetDailyOverview;
using System.Net;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/overview")]
public class OverviewController : ControllerBase
{
    private readonly GetDailyOverviewQueryHandler _getDailyOverviewQueryHandler;

    public OverviewController(GetDailyOverviewQueryHandler getDailyOverviewQueryHandler)
    {
        _getDailyOverviewQueryHandler = getDailyOverviewQueryHandler;
    }

    [HttpGet("daily", Name = "GetDailyOverview")]
    [ProducesResponseType(typeof(DailyOverviewVM), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<DailyOverviewVM>> GetDailyOverview([FromQuery] DateOnly date)
    {
        var vm = await _getDailyOverviewQueryHandler.Handle(new GetDailyOverviewQuery { Date = date });
        return Ok(vm);
    }
}
