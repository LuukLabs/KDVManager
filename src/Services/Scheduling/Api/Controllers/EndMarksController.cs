using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.Scheduling.Application.Features.EndMarks.Commands.AddEndMark;
using KDVManager.Services.Scheduling.Application.Features.EndMarks.Commands.DeleteEndMark;
using KDVManager.Services.Scheduling.Application.Features.EndMarks.Queries.GetEndMarks;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class EndMarksController : ControllerBase
{
    private readonly AddEndMarkCommandHandler _addHandler;
    private readonly DeleteEndMarkCommandHandler _deleteHandler;
    private readonly GetEndMarksQueryHandler _listHandler;

    public EndMarksController(AddEndMarkCommandHandler addHandler, DeleteEndMarkCommandHandler deleteHandler, GetEndMarksQueryHandler listHandler)
    {
        _addHandler = addHandler;
        _deleteHandler = deleteHandler;
        _listHandler = listHandler;
    }

    [HttpGet(Name = "ListEndMarks")]
    [ProducesResponseType(typeof(List<EndMarkDto>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<List<EndMarkDto>>> ListEndMarks([FromQuery] GetEndMarksQuery query)
    {
        var result = await _listHandler.Handle(query);
        return Ok(result);
    }

    [HttpPost(Name = "AddEndMark")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    public async Task<ActionResult> AddEndMark([FromBody] AddEndMarkCommand command)
    {
        await _addHandler.Handle(command);
        return NoContent();
    }

    [HttpDelete("{Id:guid}", Name = "DeleteEndMark")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    public async Task<ActionResult> DeleteEndMark([FromRoute] DeleteEndMarkCommand command)
    {
        await _deleteHandler.Handle(command);
        return NoContent();
    }
}
