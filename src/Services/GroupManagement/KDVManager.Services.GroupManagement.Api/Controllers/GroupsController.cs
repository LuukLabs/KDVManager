using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.GroupManagement.Application.Features.Groups.Commands.CreateGroup;
using KDVManager.Services.GroupManagement.Application.Features.Groups.Queries.GetGroupList;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.GroupManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<GroupsController> _logger;

        public GroupsController(IMediator mediator, ILogger<GroupsController> logger)
        {
            _logger = logger;
            _mediator = mediator;
        }

        [HttpGet("", Name = "GetAllGroups")]
        public async Task<ActionResult<List<GroupListVM>>> GetAllGroups()
        {
            var dtos = await _mediator.Send(new GetGroupsListQuery());
            return Ok(dtos);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> Create([FromBody] CreateGroupCommand createGroupCommand)
        {
            var id = await _mediator.Send(createGroupCommand);
            return Ok(id);
        }
    }
}
