using System;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.Attendance.Queries.GetAttendanceList;

public class AttendanceListVM
{
    public string GroupName { get; set; }
    public string DayName { get; set; }
    public string MonthName { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public int DayOfWeek { get; set; }
    public List<DateTime> Dates { get; set; } = new List<DateTime>();
    public List<AttendanceChildVM> Children { get; set; } = new List<AttendanceChildVM>();
    public bool IsEmpty { get; set; }
}

public class AttendanceChildVM
{
    public Guid ChildId { get; set; }
    public string FullName { get; set; }
    public DateTime DateOfBirth { get; set; }
    public int Age { get; set; }
    public TimeSpan BeginTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public List<AttendanceScheduleVM> Schedules { get; set; } = new List<AttendanceScheduleVM>();
}

public class AttendanceScheduleVM
{
    public DateTime Date { get; set; }
    public bool IsScheduled { get; set; }
    public TimeSpan? BeginTime { get; set; }
    public TimeSpan? EndTime { get; set; }
}
