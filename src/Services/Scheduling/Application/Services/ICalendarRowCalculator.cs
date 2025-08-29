using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Services;

public interface ICalendarRowCalculator
{
    Task<List<CalendarRowCache>> RecalculateAsync(Guid groupId, DateOnly startDate, DateOnly endDate);
}
