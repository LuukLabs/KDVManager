using System;
using System.Threading.Tasks;

namespace KDVManager.Services.Scheduling.Application.Services;

public interface IScheduleTimelineService
{
    Task RecalculateAsync(Guid childId);
}
