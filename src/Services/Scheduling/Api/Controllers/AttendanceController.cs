using KDVManager.Services.Scheduling.Application.Features.Attendance.Queries.GetAttendanceList;
using KDVManager.Services.Scheduling.Application.Features.Attendance.Queries.GetGroupsWithScheduling;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly GetAttendanceListQueryHandler _getAttendanceListQueryHandler;
    private readonly GetGroupsWithSchedulingQueryHandler _getGroupsWithSchedulingQueryHandler;
    private readonly ILogger<AttendanceController> _logger;

    public AttendanceController(
        GetAttendanceListQueryHandler getAttendanceListQueryHandler,
        GetGroupsWithSchedulingQueryHandler getGroupsWithSchedulingQueryHandler,
        ILogger<AttendanceController> logger)
    {
        _getAttendanceListQueryHandler = getAttendanceListQueryHandler;
        _getGroupsWithSchedulingQueryHandler = getGroupsWithSchedulingQueryHandler;
        _logger = logger;
    }

    /// <summary>
    /// Gets attendance list data for a specific group, month, and day of week
    /// </summary>
    /// <param name="year">The year</param>
    /// <param name="month">The month (1-12)</param>
    /// <param name="dayOfWeek">The day of week (0=Sunday, 1=Monday, etc.)</param>
    /// <param name="groupId">The group ID (-1 for all groups)</param>
    /// <returns>Attendance list data</returns>
    [HttpGet("list", Name = "GetAttendanceList")]
    [ProducesResponseType(typeof(AttendanceListVM), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<AttendanceListVM>> GetAttendanceList(
        [FromQuery] int year,
        [FromQuery] int month,
        [FromQuery] int dayOfWeek,
        [FromQuery] int groupId)
    {
        var query = new GetAttendanceListQuery
        {
            Year = year,
            Month = month,
            DayOfWeek = dayOfWeek,
            GroupId = groupId
        };

        var result = await _getAttendanceListQueryHandler.Handle(query);
        return Ok(result);
    }

    /// <summary>
    /// Gets groups that have scheduled activities between dates
    /// </summary>
    /// <param name="startDate">Start date</param>
    /// <param name="endDate">End date</param>
    /// <returns>List of groups with scheduling</returns>
    [HttpGet("groups", Name = "GetGroupsWithScheduling")]
    [ProducesResponseType(typeof(List<GroupWithSchedulingVM>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<List<GroupWithSchedulingVM>>> GetGroupsWithScheduling(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var query = new GetGroupsWithSchedulingQuery
        {
            StartDate = startDate,
            EndDate = endDate
        };

        var result = await _getGroupsWithSchedulingQueryHandler.Handle(query);
        return Ok(result);
    }
}
