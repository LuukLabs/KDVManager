using System;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.Attendance.Queries.GetGroupsWithScheduling;

public class GetGroupsWithSchedulingQuery
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class GroupWithSchedulingVM
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int GroupNumber { get; set; }
}
