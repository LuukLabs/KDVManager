namespace KDVManager.Services.Scheduling.Application.Features.Attendance.Queries.GetAttendanceList;

public class GetAttendanceListQuery
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int DayOfWeek { get; set; }
    public int GroupId { get; set; }
}
