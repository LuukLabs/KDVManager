using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalendarController : ControllerBase
{
    private readonly ICalendarService _calendarService;

    public CalendarController(ICalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    /// <summary>
    /// Get calendar events for all closure periods (global) between dates.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CalendarEvent>>> GetAll([FromQuery] DateOnly from, [FromQuery] DateOnly to)
    {
        var result = await _calendarService.GetAllAsync(from, to);
        return Ok(result);
    }

    /// <summary>
    /// Get calendar events for a specific child.
    /// </summary>
    [HttpGet("children/{childId:guid}")]
    public async Task<ActionResult<IReadOnlyList<CalendarEvent>>> GetForChild(Guid childId, [FromQuery] DateOnly from, [FromQuery] DateOnly to)
    {
        var result = await _calendarService.GetForChildAsync(childId, from, to);
        return Ok(result);
    }

    /// <summary>
    /// Get calendar events for a specific group.
    /// </summary>
    [HttpGet("groups/{groupId:guid}")]
    public async Task<ActionResult<IReadOnlyList<CalendarEvent>>> GetForGroup(Guid groupId, [FromQuery] DateOnly from, [FromQuery] DateOnly to)
    {
        var result = await _calendarService.GetForGroupsAsync(new[]{ groupId }, from, to);
        return Ok(result);
    }

    /// <summary>
    /// Get calendar events for multiple groups (comma separated groupIds query parameter) e.g. ?groupIds=guid1,guid2.
    /// </summary>
    [HttpGet("groups")]
    public async Task<ActionResult<IReadOnlyList<CalendarEvent>>> GetForGroups([FromQuery] string groupIds, [FromQuery] DateOnly from, [FromQuery] DateOnly to)
    {
        var ids = (groupIds ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(s => Guid.TryParse(s, out var g) ? g : Guid.Empty)
            .Where(g => g != Guid.Empty)
            .ToList();
        var result = await _calendarService.GetForGroupsAsync(ids, from, to);
        return Ok(result);
    }
}
