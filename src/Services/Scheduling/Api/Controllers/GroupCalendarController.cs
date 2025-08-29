using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("api/groups/{groupId:guid}/calendar")]
public class GroupCalendarController : ControllerBase
{
    private readonly ICalendarRowQueryService _queryService;

    public GroupCalendarController(ICalendarRowQueryService queryService)
    {
        _queryService = queryService;
    }

    [HttpGet("rows")]
    public async Task<IActionResult> GetRows(Guid groupId, [FromQuery] DateOnly start, [FromQuery] DateOnly end, [FromQuery] bool force = false)
    {
        var rows = await _queryService.GetRowsAsync(groupId, start, end, force);
        var response = rows.Select(r => new
        {
            groupId = r.GroupId,
            childId = r.ChildId,
            date = r.Date.ToString("yyyy-MM-dd"),
            slotId = r.SlotId,
            slotName = r.SlotName,
            start = r.StartTime.ToString("HH:mm"),
            end = r.EndTime.ToString("HH:mm"),
            status = r.Status,
            reason = r.Reason
        });
        return Ok(response);
    }

    [HttpGet("aggregations")]
    public async Task<IActionResult> GetAggregations(Guid groupId, [FromQuery] DateOnly start, [FromQuery] DateOnly end, [FromQuery] bool force = false)
    {
        var aggs = await _queryService.GetAggregationsAsync(groupId, start, end, force);
        var response = aggs.Select(a => new
        {
            date = a.Date.ToString("yyyy-MM-dd"),
            start = a.StartTime.ToString("HH:mm"),
            end = a.EndTime.ToString("HH:mm"),
            present = a.Present,
            absent = a.Absent,
            closed = a.Closed
        });
        return Ok(response);
    }
}
