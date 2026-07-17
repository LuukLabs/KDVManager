namespace KDVManager.Services.Scheduling.Application.Features.Attendance.UpsertAttendance;

public sealed class UpsertAttendanceCommand
{
    public DateOnly Date { get; set; }
    public DateTimeOffset? CheckedInAt { get; set; }
    public DateTimeOffset? CheckedOutAt { get; set; }
}
