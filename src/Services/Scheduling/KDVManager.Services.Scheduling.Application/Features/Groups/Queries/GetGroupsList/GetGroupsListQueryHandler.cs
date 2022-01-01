using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Queries.GetGroupList
{
    public class GetGroupsListQueryHandler : IRequestHandler<GetGroupsListQuery, List<GroupListVM>>
    {
        private readonly IAsyncRepository<Group> _groupRepository;
        private readonly IMapper _mapper;

        public GetGroupsListQueryHandler(IMapper mapper, IAsyncRepository<Group> groupRepository)
        {
            _groupRepository = groupRepository;
            _mapper = mapper;
        }

        public async Task<List<GroupListVM>> Handle(GetGroupsListQuery request, CancellationToken cancellationToken)
        {
            var groups = await _groupRepository.ListAllAsync();
            return _mapper.Map<List<GroupListVM>>(groups);
        }
    }
}
