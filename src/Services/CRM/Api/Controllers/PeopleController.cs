using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Services.CRM.Application.Features.People.Commands.AddPerson;
using KDVManager.Services.CRM.Application.Features.People.Queries.GetPersonList;

namespace KDVManager.Services.CRM.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class PeopleController : ControllerBase
{
    private readonly ILogger<PeopleController> _logger;
    private readonly GetPersonListQueryHandler _getPersonListQueryHandler;
    private readonly AddPersonCommandHandler _addPersonCommandHandler;

    public PeopleController(
        ILogger<PeopleController> logger,
        GetPersonListQueryHandler getPersonListQueryHandler,
        AddPersonCommandHandler addPersonCommandHandler)
    {
        _logger = logger;
        _getPersonListQueryHandler = getPersonListQueryHandler;
        _addPersonCommandHandler = addPersonCommandHandler;
    }

    [HttpGet("", Name = "GetAllPeople")]
    public async Task<ActionResult<PagedList<PersonListVM>>> GetAllPeople([FromQuery] GetPersonListQuery getPersonListQuery)
    {
        var dtos = await _getPersonListQueryHandler.Handle(getPersonListQuery);
        Response.Headers.Append("x-Total", dtos.TotalCount.ToString());
        return Ok(dtos);
    }

    [HttpPost(Name = "AddPerson")]
    public async Task<ActionResult<Guid>> AddPerson([FromBody] AddPersonCommand addPersonCommand)
    {
        var id = await _addPersonCommandHandler.Handle(addPersonCommand);
        return Ok(id);
    }

}
