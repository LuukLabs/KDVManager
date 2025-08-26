using KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.AddTimeSlot;
using KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.UpdateTimeSlot;
using KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.DeleteTimeSlot;
using KDVManager.Services.Scheduling.Application.Features.TimeSlots.Queries.ListTimeSlots;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using System.Net;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class TimeSlotsController : ControllerBase
{
    private readonly ListTimeSlotsQueryHandler _listTimeSlotsQueryHandler;
    private readonly AddTimeSlotCommandHandler _addTimeSlotCommandHandler;
    private readonly UpdateTimeSlotCommandHandler _updateTimeSlotCommandHandler;
    private readonly ILogger<TimeSlotsController> _logger;
    private readonly DeleteTimeSlotCommandHandler _deleteTimeSlotCommandHandler;

    public TimeSlotsController(
        ListTimeSlotsQueryHandler listTimeSlotsQueryHandler,
        AddTimeSlotCommandHandler addTimeSlotCommandHandler,
        UpdateTimeSlotCommandHandler updateTimeSlotCommandHandler,
        DeleteTimeSlotCommandHandler deleteTimeSlotCommandHandler,
        ILogger<TimeSlotsController> logger)
    {
        _listTimeSlotsQueryHandler = listTimeSlotsQueryHandler;
        _addTimeSlotCommandHandler = addTimeSlotCommandHandler;
        _updateTimeSlotCommandHandler = updateTimeSlotCommandHandler;
        _deleteTimeSlotCommandHandler = deleteTimeSlotCommandHandler;
        _logger = logger;
    }

    [HttpGet("", Name = "ListTimeSlots")]
    public async Task<ActionResult<PagedList<TimeSlotListVM>>> ListTimeSlots([FromQuery] ListTimeSlotsQuery listTimeSlotsQuery)
    {
        var dtos = await _listTimeSlotsQueryHandler.Handle(listTimeSlotsQuery);
        Response.Headers.Append("x-Total", dtos.TotalCount.ToString());
        return Ok(dtos);
    }

    [HttpPost(Name = "AddTimeSlot")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(UnprocessableEntityResponse), (int)HttpStatusCode.UnprocessableEntity)]
    public async Task<ActionResult<Guid>> AddTimeSlot([FromBody] AddTimeSlotCommand addTimeSlotCommand)
    {
        var id = await _addTimeSlotCommandHandler.Handle(addTimeSlotCommand);
        return Ok(id);
    }

    [HttpPut("{id}", Name = "UpdateTimeSlot")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [ProducesResponseType(typeof(UnprocessableEntityResponse), (int)HttpStatusCode.UnprocessableEntity)]
    public async Task<ActionResult> UpdateTimeSlot(Guid id, [FromBody] UpdateTimeSlotCommand updateTimeSlotCommand)
    {
        updateTimeSlotCommand.Id = id;
        await _updateTimeSlotCommandHandler.Handle(updateTimeSlotCommand);
        return NoContent();
    }

    [HttpDelete("{id}", Name = "DeleteTimeSlot")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [ProducesResponseType((int)HttpStatusCode.Conflict)]
    public async Task<ActionResult> DeleteTimeSlot(Guid id)
    {
        await _deleteTimeSlotCommandHandler.Handle(new DeleteTimeSlotCommand { Id = id });
        return NoContent();
    }
}
