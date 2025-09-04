using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.Scheduling.Application.Features.EndMarkSettings.Queries.GetEndMarkSettings;
using KDVManager.Services.Scheduling.Application.Features.EndMarkSettings.Commands.UpdateEndMarkSettings;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class EndMarkSettingsController : ControllerBase
{
    private readonly GetEndMarkSettingsQueryHandler _getHandler;
    private readonly UpdateEndMarkSettingsCommandHandler _updateHandler;

    public EndMarkSettingsController(
        GetEndMarkSettingsQueryHandler getHandler,
        UpdateEndMarkSettingsCommandHandler updateHandler)
    {
        _getHandler = getHandler;
        _updateHandler = updateHandler;
    }

    [HttpGet(Name = "GetEndMarkSettings")]
    [ProducesResponseType(typeof(EndMarkSettingsDto), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<EndMarkSettingsDto>> GetEndMarkSettings()
    {
        var query = new GetEndMarkSettingsQuery();
        var result = await _getHandler.Handle(query);
        return Ok(result);
    }

    [HttpPut(Name = "UpdateEndMarkSettings")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    public async Task<ActionResult> UpdateEndMarkSettings([FromBody] UpdateEndMarkSettingsCommand command)
    {
        await _updateHandler.Handle(command);
        return NoContent();
    }
}
