using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Shared.Contracts.Enums;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList;

public class GetChildListQueryHandler
{
    private readonly IChildRepository _childRepository;

    public GetChildListQueryHandler(IChildRepository childRepository)
    {
        _childRepository = childRepository;
    }

    public async Task<PagedList<ChildListVM>> Handle(GetChildListQuery request)
    {
        var children = await _childRepository.PagedWithIntervalsAsync(request, request.Search);
        var count = await _childRepository.CountAsync(request.Search);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        List<ChildListVM> childListVMs = children.Select(child =>
        {
            var status = child.GetSchedulingStatus(today);
            DateOnly? relevantDate = status switch
            {
                ChildSchedulingStatus.Active => child.GetActiveEndDate(today),
                ChildSchedulingStatus.Upcoming => child.GetNextUpcomingStartDate(today),
                _ => null
            };

            return new ChildListVM
            {
                Id = child.Id,
                FullName = (child.GivenName + " " + child.FamilyName).Trim(),
                DateOfBirth = child.DateOfBirth,
                ChildNumber = child.ChildNumber,
                SchedulingStatus = status,
                StatusRelevantDate = relevantDate
            };
        }).ToList();

        return new PagedList<ChildListVM>(childListVMs, count);
    }
}
