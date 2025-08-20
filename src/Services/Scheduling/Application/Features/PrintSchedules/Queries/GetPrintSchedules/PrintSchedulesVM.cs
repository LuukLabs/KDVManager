using System;
using System.Collections.Generic;

namespace KDVManager.Services.Scheduling.Application.Features.PrintSchedules.Queries.GetPrintSchedules;

public class PrintSchedulesVM
{
    public string Month { get; set; } = default!;
    public int Year { get; set; }
    public List<PrintGroupVM> Groups { get; set; } = new();
}

public class PrintGroupVM
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public List<PrintGroupWeekdayPageVM> Pages { get; set; } = new();
}

public class PrintGroupWeekdayPageVM
{
    public DayOfWeek Weekday { get; set; }
    public List<DateOnly> Dates { get; set; } = new();
    public List<PrintChildVM> Children { get; set; } = new();
}

public class PrintChildVM
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public Dictionary<string, PrintCellVM> Schedule { get; set; } = new();
}

public class PrintCellVM
{
    public string Status { get; set; } = default!; // scheduled | absence | closed
    public string? AbsenceType { get; set; }
    public string? StartTime { get; set; }
    public string? EndTime { get; set; }
}
