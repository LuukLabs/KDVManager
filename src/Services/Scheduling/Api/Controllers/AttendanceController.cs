using KDVManager.Services.Scheduling.Application.Features.Attendance.UpsertAttendance;
using Microsoft.AspNetCore.Mvc;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/attendance")]
public sealed class AttendanceController(UpsertAttendanceCommandHandler handler) : ControllerBase
{
    [HttpGet("children/{childId:guid}")]
    public async Task<ActionResult<AttendanceRecordVM>> Get(Guid childId, [FromQuery] DateOnly date)
    {
        var record = await handler.Get(childId, date);
        return record is null ? NotFound() : Ok(record);
    }

    [HttpPut("children/{childId:guid}")]
    public async Task<ActionResult<AttendanceRecordVM>> Upsert(Guid childId, [FromBody] UpsertAttendanceCommand command) =>
        Ok(await handler.Handle(childId, command));
}
