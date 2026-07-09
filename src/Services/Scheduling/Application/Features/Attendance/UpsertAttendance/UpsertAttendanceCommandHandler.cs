using System.Security.Claims;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace KDVManager.Services.Scheduling.Application.Features.Attendance.UpsertAttendance;

public sealed class UpsertAttendanceCommandHandler(
    IAttendanceRepository attendanceRepository,
    IChildRepository childRepository,
    IHttpContextAccessor httpContextAccessor)
{
    public async Task<AttendanceRecordVM?> Get(Guid childId, DateOnly date)
    {
        var record = await attendanceRepository.GetAsync(childId, date);
        return record is null ? null : new AttendanceRecordVM { ChildId = record.ChildId, Date = record.Date, CheckedInAt = record.CheckedInAt, CheckedOutAt = record.CheckedOutAt };
    }

    public async Task<AttendanceRecordVM> Handle(Guid childId, UpsertAttendanceCommand command)
    {
        if (command.Date == default) throw new ArgumentException("A date is required.");
        if (command.CheckedOutAt is not null && (command.CheckedInAt is null || command.CheckedOutAt < command.CheckedInAt))
            throw new ArgumentException("Check-out must be after check-in.");
        if (!await childRepository.ExistsAsync(childId)) throw new KeyNotFoundException("Child was not found.");

        var now = DateTimeOffset.UtcNow;
        var subject = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? httpContextAccessor.HttpContext?.User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException("Authenticated user subject is required.");
        var previous = await attendanceRepository.GetAsync(childId, command.Date);
        var record = await attendanceRepository.UpsertAsync(new AttendanceRecord
        {
            Id = Guid.NewGuid(), ChildId = childId, Date = command.Date,
            CheckedInAt = command.CheckedInAt, CheckedOutAt = command.CheckedOutAt,
            CreatedBySubject = subject, CreatedAt = now, UpdatedAt = now
        }, new AttendanceAuditEntry
        {
            Id = Guid.NewGuid(), PreviousCheckedInAt = previous?.CheckedInAt, PreviousCheckedOutAt = previous?.CheckedOutAt,
            CheckedInAt = command.CheckedInAt, CheckedOutAt = command.CheckedOutAt, ActorSubject = subject, OccurredAt = now
        });
        return new AttendanceRecordVM { ChildId = record.ChildId, Date = record.Date, CheckedInAt = record.CheckedInAt, CheckedOutAt = record.CheckedOutAt };
    }
}
