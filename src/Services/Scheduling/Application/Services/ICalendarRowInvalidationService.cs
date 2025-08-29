using System;
using System.Threading.Tasks;

namespace KDVManager.Services.Scheduling.Application.Services;

public interface ICalendarRowInvalidationService
{
    Task InvalidateGroupRangeAsync(Guid groupId, DateOnly startDate, DateOnly endDate);
    Task InvalidateGroupAsync(Guid groupId);
}
