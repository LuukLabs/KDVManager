using KDVManager.Services.Scheduling.Application.Features.Groups.Queries.ListGroups;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetChildSchedules;
using System.Net;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.AddSchedule;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetSchedulesByDate;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.DeleteSchedule;
using KDVManager.Services.Scheduling.Application.Features.GroupSummary.Queries.GetGroupSummary;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class SchedulesController : ControllerBase
{
    private readonly GetChildSchedulesQueryHandler _getChildSchedulesQueryHandler;
    private readonly GetSchedulesByDateQueryHandler _getSchedulesByDateQueryHandler;
    private readonly GetGroupSummaryQueryHandler _getGroupSummaryQueryHandler;
    private readonly AddScheduleCommandHandler _addScheduleCommandHandler;
    private readonly DeleteScheduleCommandHandler _deleteScheduleCommandHandler;
    private readonly ILogger<SchedulesController> _logger;

    public SchedulesController(
        GetChildSchedulesQueryHandler getChildSchedulesQueryHandler,
        GetSchedulesByDateQueryHandler getSchedulesByDateQueryHandler,
        GetGroupSummaryQueryHandler getGroupSummaryQueryHandler,
        AddScheduleCommandHandler addScheduleCommandHandler,
        DeleteScheduleCommandHandler deleteScheduleCommandHandler,
        ILogger<SchedulesController> logger)
    {
        _getChildSchedulesQueryHandler = getChildSchedulesQueryHandler;
        _getSchedulesByDateQueryHandler = getSchedulesByDateQueryHandler;
        _getGroupSummaryQueryHandler = getGroupSummaryQueryHandler;
        _addScheduleCommandHandler = addScheduleCommandHandler;
        _deleteScheduleCommandHandler = deleteScheduleCommandHandler;
        _logger = logger;
    }

    [HttpGet("", Name = "GetChildSchedules")]
    public async Task<ActionResult<List<ChildScheduleListVM>>> ListScheduleItems([FromQuery] GetChildSchedulesQuery getChildSchedulesQuery)
    {
        var dtos = await _getChildSchedulesQueryHandler.Handle(getChildSchedulesQuery);
        return Ok(dtos);
    }

    [HttpGet("daterange", Name = "GetSchedulesByDate")]
    [ProducesResponseType(typeof(List<ScheduleByDateVM>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<List<ScheduleByDateVM>>> GetSchedulesByDateRange([FromQuery] GetSchedulesByDateQuery getSchedulesByDateQuery)
    {
        var schedules = await _getSchedulesByDateQueryHandler.Handle(getSchedulesByDateQuery);
        return Ok(schedules);
    }

    [HttpGet("group-summary", Name = "GetGroupSummary")]
    [ProducesResponseType(typeof(GroupSummaryVM), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<GroupSummaryVM>> GetGroupSummary([FromQuery] GetGroupSummaryQuery getGroupSummaryQuery)
    {
        var summary = await _getGroupSummaryQueryHandler.Handle(getGroupSummaryQuery);
        return Ok(summary);
    }

    [HttpPost(Name = "AddSchedule")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(UnprocessableEntityResponse), (int)HttpStatusCode.UnprocessableEntity)]
    public async Task<ActionResult<Guid>> AddScheduleItem([FromBody] AddScheduleCommand addScheduleCommand)
    {
        var id = await _addScheduleCommandHandler.Handle(addScheduleCommand);
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
        await _deleteScheduleCommandHandler.Handle(deleteScheduleCommand);
        return NoContent();
    }
}
