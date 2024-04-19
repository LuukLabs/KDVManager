using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Features.Groups.Commands.AddGroup;
using KDVManager.Services.Scheduling.Application.Features.Groups.Queries.ListGroups;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using System.Net;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using System.Net.Mime;
using KDVManager.Services.Scheduling.Application.Features.Groups.Commands.DeleteGroup;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class GroupsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<GroupsController> _logger;

    public GroupsController(IMediator mediator, ILogger<GroupsController> logger)
    {
        _logger = logger;
        _mediator = mediator;
    }

    [HttpGet("", Name = "ListGroups")]
    public async Task<ActionResult<PagedList<GroupListVM>>> ListGroups([FromQuery] ListGroupsQuery listGroupsQuery)
    {
        var dtos = await _mediator.Send(listGroupsQuery);
        Response.Headers.Add("x-Total", dtos.TotalCount.ToString());
        return Ok(dtos);
    }

    [HttpPost(Name = "AddGroup")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(UnprocessableEntityResponse), (int)HttpStatusCode.UnprocessableEntity)]
    public async Task<ActionResult<Guid>> AddGroup([FromBody] AddGroupCommand addGroupCommand)
    {
        var id = await _mediator.Send(addGroupCommand);
        return Ok(id);
    }

    /// <summary>
    /// Deletes a group by ID.
    /// </summary>
    /// <param name="Id">The ID of the group to delete.</param>
    [HttpDelete("{Id:guid}", Name = "DeleteGroup")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [Produces("application/json")]
    public async Task<ActionResult> DeleteGroup([FromRoute] DeleteGroupCommand deleteGroupCommand)
    {
        await _mediator.Send(deleteGroupCommand);
        return NoContent();
    }
}
