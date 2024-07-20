using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Queries.ListTimeSlots;

public class ListTimeSlotsQuery : PageParameters, IRequest<PagedList<TimeSlotListVM>>
{
}

