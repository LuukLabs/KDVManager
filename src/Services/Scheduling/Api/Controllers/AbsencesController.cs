using Microsoft.AspNetCore.Mvc;
using System.Net;
using KDVManager.Services.Scheduling.Application.Features.Absences.Queries.GetAbsencesByChildId;
using KDVManager.Services.Scheduling.Application.Features.Absences.Commands.AddAbsence;
using KDVManager.Services.Scheduling.Application.Features.Absences.Commands.DeleteAbsence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/absences")]
public class AbsencesController : ControllerBase
{
    private readonly ILogger<AbsencesController> _logger;
    private readonly GetAbsencesByChildIdQueryHandler _getAbsencesByChildIdQueryHandler;
    private readonly AddAbsenceCommandHandler _addAbsenceCommandHandler;
    private readonly DeleteAbsenceCommandHandler _deleteAbsenceCommandHandler;

    public AbsencesController(ILogger<AbsencesController> logger,
    GetAbsencesByChildIdQueryHandler getAbsencesByChildIdQueryHandler,
    AddAbsenceCommandHandler addAbsenceCommandHandler,
    DeleteAbsenceCommandHandler deleteAbsenceCommandHandler
    )
    {
        _getAbsencesByChildIdQueryHandler = getAbsencesByChildIdQueryHandler;
        _addAbsenceCommandHandler = addAbsenceCommandHandler;
        _deleteAbsenceCommandHandler = deleteAbsenceCommandHandler;
        _logger = logger;
    }

    [HttpGet("/v1/children/{childId}/absences", Name = "GetAbsencesByChildId")]
    public async Task<ActionResult<List<AbsenceListByChildIdVM>>> GetAbsencesByChildId([FromRoute] Guid childId)
    {
        var query = new GetAbsencesByChildIdQuery { ChildId = childId };
        var dtos = await _getAbsencesByChildIdQueryHandler.Handle(query);
        return Ok(dtos);
    }

    [HttpPost("/v1/children/{childId}/absences", Name = "AddAbsence")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(UnprocessableEntityResponse), (int)HttpStatusCode.UnprocessableEntity)]
    public async Task<ActionResult<Guid>> AddAbsence([FromRoute] Guid childId, [FromBody] AddAbsenceCommand addAbsenceCommand)
    {
        addAbsenceCommand.ChildId = childId;
        Guid id = await _addAbsenceCommandHandler.Handle(addAbsenceCommand);
        return Ok(id);
    }

    /// <summary>
    /// Deletes a group by ID.
    /// </summary>
    /// <param name="Id">The ID of the group to delete.</param>
    [HttpDelete("{Id:guid}", Name = "DeleteAbsence")]
    [ProducesResponseType((int)HttpStatusCode.NoContent)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [ProducesResponseType((int)HttpStatusCode.Conflict)]
    [Produces("application/json")]
    public async Task<ActionResult> DeleteGroup([FromRoute] DeleteAbsenceCommand deleteAbsenceCommand)
    {
        await _deleteAbsenceCommandHandler.Handle(deleteAbsenceCommand);
        return NoContent();
    }
}
