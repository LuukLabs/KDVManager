using KDVManager.Services.Scheduling.Application.Features.Groups.Commands.AddGroup;
using KDVManager.Services.Scheduling.Application.Features.Groups.Queries.ListGroups;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using System.Net;
using KDVManager.Services.Scheduling.Application.Features.Groups.Commands.DeleteGroup;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class GroupsController : ControllerBase
{
    private readonly ListGroupsQueryHandler _listGroupsQueryHandler;
    private readonly AddGroupCommandHandler _addGroupCommandHandler;
    private readonly DeleteGroupCommandHandler _deleteGroupCommandHandler;
    private readonly ILogger<GroupsController> _logger;

    public GroupsController(
        ListGroupsQueryHandler listGroupsQueryHandler,
        AddGroupCommandHandler addGroupCommandHandler,
        DeleteGroupCommandHandler deleteGroupCommandHandler,
        ILogger<GroupsController> logger)
    {
        _listGroupsQueryHandler = listGroupsQueryHandler;
        _addGroupCommandHandler = addGroupCommandHandler;
        _deleteGroupCommandHandler = deleteGroupCommandHandler;
        _logger = logger;
    }

    [HttpGet("", Name = "ListGroups")]
    public async Task<ActionResult<PagedList<GroupListVM>>> ListGroups([FromQuery] ListGroupsQuery listGroupsQuery)
    {
        var dtos = await _listGroupsQueryHandler.Handle(listGroupsQuery);
        Response.Headers.Append("x-Total", dtos.TotalCount.ToString());
        return Ok(dtos);
    }

    [HttpPost(Name = "AddGroup")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(UnprocessableEntityResponse), (int)HttpStatusCode.UnprocessableEntity)]
    public async Task<ActionResult<Guid>> AddGroup([FromBody] AddGroupCommand addGroupCommand)
    {
        var id = await _addGroupCommandHandler.Handle(addGroupCommand);
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
        await _deleteGroupCommandHandler.Handle(deleteGroupCommand);
        return NoContent();
    }
}
