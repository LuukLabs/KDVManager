using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using KDVManager.Services.Scheduling.Domain.Entities;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Queries.ListGroups;

public class ListGroupsQueryHandler : IRequestHandler<ListGroupsQuery, PagedList<GroupListVM>>
{
    private readonly IGroupRepository _groupRepository;
    private readonly IMapper _mapper;

    public ListGroupsQueryHandler(IMapper mapper, IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
        _mapper = mapper;
    }

    public async Task<PagedList<GroupListVM>> Handle(ListGroupsQuery request, CancellationToken cancellationToken)
    {
        var groups = await _groupRepository.PagedAsync(request);
        var count = await _groupRepository.CountAsync();

        List<GroupListVM> groupListVMs = _mapper.Map<List<GroupListVM>>(groups);

        return new PagedList<GroupListVM>(groupListVMs, count);
    }
}

