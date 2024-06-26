using KDVManager.Services.CRM.Application.Features.Children.Commands.CreateChild;
using KDVManager.Services.CRM.Application.Features.Children.Commands.DeleteChild;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildDetail;
using KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild;

namespace KDVManager.Services.CRM.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class ChildrenController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<ChildrenController> _logger;

    public ChildrenController(IMediator mediator, ILogger<ChildrenController> logger)
    {
        _logger = logger;
        _mediator = mediator;
    }

    [HttpGet("", Name = "GetAllChildren")]
    public async Task<ActionResult<PagedList<ChildListVM>>> GetAllChildren([FromQuery] GetChildListQuery getChildListQuery)
    {
        var dtos = await _mediator.Send(getChildListQuery);
        Response.Headers.Add("x-Total", dtos.TotalCount.ToString());
        return Ok(dtos);
    }


    [HttpGet("{Id:guid}", Name = "GetChildById")]
    [Produces("application/json")]
    public async Task<ActionResult<ChildDetailVM>> GetChildById([FromRoute] GetChildDetailQuery getChildByIdQuery)
    {
        var dto = await _mediator.Send(getChildByIdQuery);
        return Ok(dto);
    }

    [HttpPost(Name = "CreateChild")]
    public async Task<ActionResult<Guid>> CreateChild([FromBody] CreateChildCommand createChildCommand)
    {
        var id = await _mediator.Send(createChildCommand);
        return Ok(id);
    }

    [HttpPut("{ChildId:guid}", Name = "UpdateChild")]
    public async Task<ActionResult<Guid>> UpdateChild([FromRoute] Guid ChildId, [FromBody] UpdateChildCommand updateChildCommand)
    {
        // Set the route id to the command
        updateChildCommand.Id = ChildId;

        await _mediator.Send(updateChildCommand);
        return NoContent();
    }

    [HttpDelete("{Id:guid}", Name = "DeleteChild")]
    public async Task<ActionResult<Guid>> DeleteChild([FromRoute] DeleteChildCommand deleteChildCommand)
    {
        await _mediator.Send(deleteChildCommand);
        return NoContent();
    }
}
