using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.ChildManagement.Application.Contracts.Persistence;
using KDVManager.Services.ChildManagement.Domain.Entities;
using MediatR;

namespace KDVManager.Services.ChildManagement.Application.Features.Children.Queries.GetChildList
{
    public class GetChildListQueryHandler : IRequestHandler<GetChildListQuery, List<ChildListVM>>
    {
        private readonly IAsyncRepository<Child> _childRepository;
        private readonly IMapper _mapper;

        public GetChildListQueryHandler(IMapper mapper, IAsyncRepository<Child> childRepository)
        {
            _childRepository = childRepository;
            _mapper = mapper;
        }

        public async Task<List<ChildListVM>> Handle(GetChildListQuery request, CancellationToken cancellationToken)
        {
            var children = await _childRepository.ListAllAsync();
            return _mapper.Map<List<ChildListVM>>(children);
        }
    }
}
