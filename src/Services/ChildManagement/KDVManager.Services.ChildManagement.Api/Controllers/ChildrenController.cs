using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.ChildManagement.Application.Features.Children.Commands.CreateChild;
using KDVManager.Services.ChildManagement.Application.Features.Children.Queries.GetChildList;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.ChildManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
        public async Task<ActionResult<List<ChildListVM>>> GetAllChildren()
        {
            var dtos = await _mediator.Send(new GetChildListQuery());
            return Ok(dtos);
        }

        [HttpPost(Name = "CreateChild")]
        public async Task<ActionResult<Guid>> Create([FromBody] CreateChildCommand createChildCommand)
        {
            var id = await _mediator.Send(createChildCommand);
            return Ok(id);
        }
    }
}
