using KDVManager.Services.CRM.Application.Features.Children.Commands.CreateChild;
using KDVManager.Services.CRM.Application.Features.Children.Commands.DeleteChild;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildDetail;
using KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild;
using KDVManager.Services.CRM.Application.Features.Children.Commands.ArchiveChild;

namespace KDVManager.Services.CRM.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class ChildrenController : ControllerBase
{
    private readonly ILogger<ChildrenController> _logger;
    private readonly GetChildListQueryHandler _getChildListQueryHandler;
    private readonly GetChildDetailQueryHandler _getChildDetailQueryHandler;
    private readonly CreateChildCommandHandler _createChildCommandHandler;
    private readonly UpdateChildCommandHandler _updateChildCommandHandler;
    private readonly DeleteChildCommandHandler _deleteChildCommandHandler;
    private readonly ArchiveChildCommandHandler _archiveChildCommandHandler;

    public ChildrenController(
        ILogger<ChildrenController> logger,
        GetChildListQueryHandler getChildListQueryHandler,
        GetChildDetailQueryHandler getChildDetailQueryHandler,
        CreateChildCommandHandler createChildCommandHandler,
        UpdateChildCommandHandler updateChildCommandHandler,
        DeleteChildCommandHandler deleteChildCommandHandler,
        ArchiveChildCommandHandler archiveChildCommandHandler)
    {
        _logger = logger;
        _getChildListQueryHandler = getChildListQueryHandler;
        _getChildDetailQueryHandler = getChildDetailQueryHandler;
        _createChildCommandHandler = createChildCommandHandler;
        _updateChildCommandHandler = updateChildCommandHandler;
        _deleteChildCommandHandler = deleteChildCommandHandler;
        _archiveChildCommandHandler = archiveChildCommandHandler;
    }

    [HttpGet("", Name = "GetAllChildren")]
    public async Task<ActionResult<PagedList<ChildListVM>>> GetAllChildren([FromQuery] GetChildListQuery getChildListQuery)
    {
        var dtos = await _getChildListQueryHandler.Handle(getChildListQuery);
        Response.Headers.Append("x-Total", dtos.TotalCount.ToString());
        return Ok(dtos);
    }


    [HttpGet("{Id:guid}", Name = "GetChildById")]
    [Produces("application/json")]
    public async Task<ActionResult<ChildDetailVM>> GetChildById([FromRoute] GetChildDetailQuery getChildByIdQuery)
    {
        var dto = await _getChildDetailQueryHandler.Handle(getChildByIdQuery);
        return Ok(dto);
    }

    [HttpPost(Name = "CreateChild")]
    public async Task<ActionResult<Guid>> CreateChild([FromBody] CreateChildCommand createChildCommand)
    {
        var id = await _createChildCommandHandler.Handle(createChildCommand);
        return Ok(id);
    }

    [HttpPut("{Id:guid}", Name = "UpdateChild")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    [ProducesResponseType(typeof(UnprocessableEntityResponse), (int)HttpStatusCode.UnprocessableEntity)]
    public async Task<ActionResult<Guid>> UpdateChild([FromRoute] Guid Id, [FromBody] UpdateChildCommand updateChildCommand)
    {
        // Set the route id to the command
        updateChildCommand.Id = Id;

        await _updateChildCommandHandler.Handle(updateChildCommand);
        return NoContent();
    }

    [HttpDelete("{Id:guid}", Name = "DeleteChild")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    public async Task<ActionResult> DeleteChild([FromRoute] Guid Id)
    {
        var deleteChildCommand = new DeleteChildCommand { Id = Id };
        await _deleteChildCommandHandler.Handle(deleteChildCommand);
        return NoContent();
    }

    [HttpPost("{Id:guid}/archive", Name = "ArchiveChild")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    public async Task<ActionResult> ArchiveChild([FromRoute] Guid Id)
    {
        var archiveChildCommand = new ArchiveChildCommand { Id = Id };
        await _archiveChildCommandHandler.Handle(archiveChildCommand);
        return NoContent();
    }
}
