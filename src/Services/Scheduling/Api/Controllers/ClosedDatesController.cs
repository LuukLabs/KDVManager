using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Queries.ListClosurePeriods;
using KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Commands.AddClosurePeriod;
using KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Commands.DeleteClosurePeriod;
using System.Net;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/closure-periods")]
public class ClosurePeriodsController : ControllerBase
{
    private readonly ListClosurePeriodsQueryHandler _listClosurePeriodsQueryHandler;
    private readonly AddClosurePeriodCommandHandler _addClosurePeriodCommandHandler;
    private readonly DeleteClosurePeriodCommandHandler _deleteClosurePeriodCommandHandler;

    public ClosurePeriodsController(
        ListClosurePeriodsQueryHandler listClosurePeriodsQueryHandler,
        AddClosurePeriodCommandHandler addClosurePeriodCommandHandler,
        DeleteClosurePeriodCommandHandler deleteClosurePeriodCommandHandler)
    {
        _listClosurePeriodsQueryHandler = listClosurePeriodsQueryHandler;
        _addClosurePeriodCommandHandler = addClosurePeriodCommandHandler;
        _deleteClosurePeriodCommandHandler = deleteClosurePeriodCommandHandler;
    }

    [HttpGet(Name = "ListClosurePeriods")]
    public async Task<ActionResult<List<ClosurePeriod>>> ListClosurePeriods()
    {
        var query = new ListClosurePeriodsQuery();
        var result = await _listClosurePeriodsQueryHandler.Handle(query);
        return Ok(result);
    }

    [HttpPost(Name = "AddClosurePeriod")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<Guid>> AddClosurePeriod([FromBody] AddClosurePeriodCommand command)
    {
        Guid id = await _addClosurePeriodCommandHandler.Handle(command);
        return Ok(id);
    }

    [HttpDelete("{id:guid}", Name = "DeleteClosurePeriod")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    public async Task<ActionResult> DeleteClosurePeriod([FromRoute] Guid id)
    {
        var command = new DeleteClosurePeriodCommand { Id = id };
        await _deleteClosurePeriodCommandHandler.Handle(command);
        return NoContent();
    }
}
