using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Queries.ListGroups;

public class ListGroupsQueryHandler
{
    private readonly IGroupRepository _groupRepository;

    public ListGroupsQueryHandler(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
    }

    public async Task<PagedList<GroupListVM>> Handle(ListGroupsQuery request)
    {
        var groups = await _groupRepository.PagedAsync(request);
        var count = await _groupRepository.CountAsync();

        List<GroupListVM> groupListVMs = groups.Select(group => new GroupListVM
        {
            Id = group.Id,
            Name = group.Name
        }).ToList();

        return new PagedList<GroupListVM>(groupListVMs, count);
    }
}

