using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using MediatR;
namespace KDVManager.Services.Scheduling.Application.Features.Groups.Queries.GetGroupDetail
{
    public class GetGroupDetailQueryHandler : IRequestHandler<GetGroupDetailQuery, GroupDetailVM>
    {
        private readonly IAsyncRepository<Group> _groupRepository;
        private readonly IMapper _mapper;

        public GetGroupDetailQueryHandler(IAsyncRepository<Group> groupRepository, IMapper mapper)
        {
            _groupRepository = groupRepository;
            _mapper = mapper;
        }

        public async Task<GroupDetailVM> Handle(GetGroupDetailQuery request, CancellationToken cancellationToken)
        {
            var group = await _groupRepository.GetByIdAsync(request.Id);
            return _mapper.Map<Group, GroupDetailVM>(group);
        }
    }
}
