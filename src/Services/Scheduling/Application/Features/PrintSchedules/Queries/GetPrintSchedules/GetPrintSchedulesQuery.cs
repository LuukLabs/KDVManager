using System;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.PrintSchedules.Queries.GetPrintSchedules;

public class GetPrintSchedulesQuery
{
    public int Month { get; set; }
    public int Year { get; set; }
    public Guid? GroupId { get; set; }
}
