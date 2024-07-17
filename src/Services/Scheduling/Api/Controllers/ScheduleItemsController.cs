using KDVManager.Services.Scheduling.Application.Features.Groups.Queries.ListGroups;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using KDVManager.Services.Scheduling.Application.Features.ScheduleItems.Queries.ListScheduleItems;
using System.Net;
using KDVManager.Services.Scheduling.Application.Features.ScheduleItems.Commands.AddScheduleItem;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class ScheduleItemsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<ScheduleItemsController> _logger;

    public ScheduleItemsController(IMediator mediator, ILogger<ScheduleItemsController> logger)
    {
        _logger = logger;
        _mediator = mediator;
    }

    [HttpGet("", Name = "ListScheduleItems")]
    public async Task<ActionResult<PagedList<ScheduleItemListVM>>> ListScheduleItems([FromQuery] ListScheduleItemsQuery listScheduleItemsQuery)
    {
        var dtos = await _mediator.Send(listScheduleItemsQuery);
        return Ok(dtos);
    }

    [HttpPost(Name = "AddScheduleItem")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(UnprocessableEntityResponse), (int)HttpStatusCode.UnprocessableEntity)]
    public async Task<ActionResult<Guid>> AddScheduleItem([FromBody] AddScheduleItemCommand addScheduleItemCommand)
    {
        var id = await _mediator.Send(addScheduleItemCommand);
        return Ok(id);
    }
}
