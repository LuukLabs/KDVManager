using MediatR;
using Microsoft.AspNetCore.Mvc;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Services.CRM.Application.Features.People.Commands.AddPerson;
using KDVManager.Services.CRM.Application.Features.People.Queries.GetPersonList;

namespace KDVManager.Services.CRM.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class PeopleController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<PeopleController> _logger;

    public PeopleController(IMediator mediator, ILogger<PeopleController> logger)
    {
        _logger = logger;
        _mediator = mediator;
    }

    [HttpGet("", Name = "GetAllPeople")]
    public async Task<ActionResult<PagedList<PersonListVM>>> GetAllPeople([FromQuery] GetPersonListQuery getPersonListQuery)
    {
        var dtos = await _mediator.Send(getPersonListQuery);
        Response.Headers.Add("x-Total", dtos.TotalCount.ToString());
        return Ok(dtos);
    }

    [HttpPost(Name = "AddPerson")]
    public async Task<ActionResult<Guid>> AddPerson([FromBody] AddPersonCommand addPersonCommand)
    {
        var id = await _mediator.Send(addPersonCommand);
        return Ok(id);
    }

}
