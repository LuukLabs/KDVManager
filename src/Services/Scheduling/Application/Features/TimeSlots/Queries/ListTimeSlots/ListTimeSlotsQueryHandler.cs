using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Queries.ListTimeSlots;

public class ListTimeSlotsQueryHandler : IRequestHandler<ListTimeSlotsQuery, PagedList<TimeSlotListVM>>
{
    private readonly ITimeSlotRepository _timeSlotRepository;
    private readonly IMapper _mapper;

    public ListTimeSlotsQueryHandler(IMapper mapper, ITimeSlotRepository timeSlotRepository)
    {
        _timeSlotRepository = timeSlotRepository;
        _mapper = mapper;
    }

    public async Task<PagedList<TimeSlotListVM>> Handle(ListTimeSlotsQuery request, CancellationToken cancellationToken)
    {
        var groups = await _timeSlotRepository.PagedAsync(request);
        var count = await _timeSlotRepository.CountAsync();

        List<TimeSlotListVM> timeSlotListVMs = _mapper.Map<List<TimeSlotListVM>>(groups);

        return new PagedList<TimeSlotListVM>(timeSlotListVMs, count);
    }
}

