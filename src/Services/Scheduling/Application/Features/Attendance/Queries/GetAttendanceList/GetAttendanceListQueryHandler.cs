using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Attendance.Queries.GetAttendanceList;

public class GetAttendanceListQueryHandler
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IGroupRepository _groupRepository;

    public GetAttendanceListQueryHandler(
        IScheduleRepository scheduleRepository,
        IGroupRepository groupRepository)
    {
        _scheduleRepository = scheduleRepository;
        _groupRepository = groupRepository;
    }

    public Task<AttendanceListVM> Handle(GetAttendanceListQuery request)
    {
        var startDate = new DateTime(request.Year, request.Month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        // Get Dutch month names
        var monthNames = new[] { "", "Januari", "Februari", "Maart", "April", "Mei", "Juni",
                               "Juli", "Augustus", "September", "Oktober", "November", "December" };

        // Get Dutch day names
        var dayNames = new[] { "Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag" };

        // Get group name
        string groupName;
        if (request.GroupId == -1)
        {
            groupName = "Alle";
        }
        else
        {
            // For now, just use the group number. In a real implementation, you'd query the actual group
            groupName = $"Groep {request.GroupId}";
        }

        // Find all dates in the month that match the day of week
        var matchingDates = new List<DateTime>();
        var currentDate = startDate;

        // Find first occurrence of the day of week in the month
        while (currentDate.DayOfWeek != (DayOfWeek)request.DayOfWeek)
        {
            currentDate = currentDate.AddDays(1);
        }

        // Add all occurrences of this day of week in the month
        while (currentDate.Month == request.Month)
        {
            matchingDates.Add(currentDate);
            currentDate = currentDate.AddDays(7);
        }

        // For now, return a simplified structure
        // In a real implementation, you'd query the schedules and get child data from CRM service
        var result = new AttendanceListVM
        {
            GroupName = groupName,
            DayName = dayNames[request.DayOfWeek],
            MonthName = monthNames[request.Month],
            Year = request.Year,
            Month = request.Month,
            DayOfWeek = request.DayOfWeek,
            Dates = matchingDates,
            Children = new List<AttendanceChildVM>(),
            IsEmpty = true // Will be false when we have actual data
        };

        return Task.FromResult(result);
    }
}
