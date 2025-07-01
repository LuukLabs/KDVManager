using KDVManager.Services.Scheduling.Application.Features.Groups.Queries.ListGroups;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetChildSchedules;
using System.Net;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.AddSchedule;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetSchedulesByDate;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.DeleteSchedule;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class SchedulesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<SchedulesController> _logger;

    public SchedulesController(IMediator mediator, ILogger<SchedulesController> logger)
    {
        _logger = logger;
        _mediator = mediator;
    }

    [HttpGet("", Name = "GetChildSchedules")]
    public async Task<ActionResult<PagedList<ChildScheduleListVM>>> ListScheduleItems([FromQuery] GetChildSchedulesQuery getChildSchedulesQuery)
    {
        var dtos = await _mediator.Send(getChildSchedulesQuery);
        return Ok(dtos);
    }

    [HttpGet("daterange", Name = "GetSchedulesByDate")]
    [ProducesResponseType(typeof(List<ScheduleByDateVM>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<List<ScheduleByDateVM>>> GetSchedulesByDateRange([FromQuery] GetSchedulesByDateQuery getSchedulesByDateQuery)
    {
        var schedules = await _mediator.Send(getSchedulesByDateQuery);
        return Ok(schedules);
    }

    [HttpPost(Name = "AddSchedule")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(UnprocessableEntityResponse), (int)HttpStatusCode.UnprocessableEntity)]
    public async Task<ActionResult<Guid>> AddScheduleItem([FromBody] AddScheduleCommand addScheduleCommand)
    {
        var id = await _mediator.Send(addScheduleCommand);
        return Ok(id);
    }

    /// <summary>
    /// Deletes a schedule by ID.
    /// </summary>
    /// <param name="Id">The ID of the schedule to delete.</param>
    [HttpDelete("{Id:guid}", Name = "DeleteSchedule")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [Produces("application/json")]
    public async Task<ActionResult> DeleteSchedule([FromRoute] DeleteScheduleCommand deleteScheduleCommand)
    {
        await _mediator.Send(deleteScheduleCommand);
        return NoContent();
    }
}
