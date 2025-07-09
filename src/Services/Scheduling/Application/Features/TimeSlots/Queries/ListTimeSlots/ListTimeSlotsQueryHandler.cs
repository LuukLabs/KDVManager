using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Queries.ListTimeSlots;

public class ListTimeSlotsQueryHandler
{
    private readonly ITimeSlotRepository _timeSlotRepository;

    public ListTimeSlotsQueryHandler(ITimeSlotRepository timeSlotRepository)
    {
        _timeSlotRepository = timeSlotRepository;
    }

    public async Task<PagedList<TimeSlotListVM>> Handle(ListTimeSlotsQuery request)
    {
        var timeSlots = await _timeSlotRepository.PagedAsync(request);
        var count = await _timeSlotRepository.CountAsync();

        List<TimeSlotListVM> timeSlotListVMs = timeSlots.Select(timeSlot => new TimeSlotListVM
        {
            Id = timeSlot.Id,
            Name = timeSlot.Name,
            StartTime = timeSlot.StartTime,
            EndTime = timeSlot.EndTime
        }).ToList();

        return new PagedList<TimeSlotListVM>(timeSlotListVMs, count);
    }
}

