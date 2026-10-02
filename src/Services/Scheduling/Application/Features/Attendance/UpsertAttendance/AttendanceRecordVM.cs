namespace KDVManager.Services.Scheduling.Application.Features.Attendance.UpsertAttendance;

public sealed class AttendanceRecordVM
{
    public required Guid ChildId { get; init; }
    public required DateOnly Date { get; init; }
    public DateTimeOffset? CheckedInAt { get; init; }
    public DateTimeOffset? CheckedOutAt { get; init; }
}
