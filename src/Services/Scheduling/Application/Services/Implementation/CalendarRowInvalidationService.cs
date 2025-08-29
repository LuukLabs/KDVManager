using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Services;

namespace KDVManager.Services.Scheduling.Application.Services.Implementation;

public class CalendarRowInvalidationService : ICalendarRowInvalidationService
{
    private readonly ICalendarRowCacheRepository _cacheRepository;

    public CalendarRowInvalidationService(ICalendarRowCacheRepository cacheRepository)
    {
        _cacheRepository = cacheRepository;
    }

    public Task InvalidateGroupRangeAsync(Guid groupId, DateOnly startDate, DateOnly endDate)
        => _cacheRepository.DeleteGroupRangeAsync(groupId, startDate, endDate);

    public Task InvalidateGroupAsync(Guid groupId)
        => _cacheRepository.DeleteGroupAsync(groupId);
}
