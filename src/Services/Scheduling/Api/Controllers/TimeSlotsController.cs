using KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.AddTimeSlot;
using KDVManager.Services.Scheduling.Application.Features.TimeSlots.Queries.ListTimeSlots;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using System.Net;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class TimeSlotsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<TimeSlotsController> _logger;

    public TimeSlotsController(IMediator mediator, ILogger<TimeSlotsController> logger)
    {
        _logger = logger;
        _mediator = mediator;
    }

    [HttpGet("", Name = "ListTimeSlots")]
    public async Task<ActionResult<PagedList<TimeSlotListVM>>> ListTimeSlots([FromQuery] ListTimeSlotsQuery listTimeSlotsQuery)
    {
        var dtos = await _mediator.Send(listTimeSlotsQuery);
        Response.Headers.Add("x-Total", dtos.TotalCount.ToString());
        return Ok(dtos);
    }

    [HttpPost(Name = "AddTimeSlot")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(UnprocessableEntityResponse), (int)HttpStatusCode.UnprocessableEntity)]
    public async Task<ActionResult<Guid>> AddTimeSlot([FromBody] AddTimeSlotCommand addTimeSlotCommand)
    {
        var id = await _mediator.Send(addTimeSlotCommand);
        return Ok(id);
    }
}
