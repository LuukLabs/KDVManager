using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.ChildManagement.Application.Contracts.Infrastructure;
using KDVManager.Services.ChildManagement.Domain.Entities;
using KDVManager.Services.ChildManagement.Domain.ValueObjects;
using MediatR;

namespace KDVManager.Services.ChildManagement.Application.Features.Children.Queries.GetChildList
{
    public class GetChildListQueryHandler : IRequestHandler<GetChildListQuery, List<ChildListVM>>
    {
        private readonly IChildRepository _childRepository;
        private readonly IMapper _mapper;

        public GetChildListQueryHandler(IMapper mapper, IChildRepository childRepository)
        {
            _childRepository = childRepository;
            _mapper = mapper;
        }

        public async Task<List<ChildListVM>> Handle(GetChildListQuery request, CancellationToken cancellationToken)
        {
            var paginationFilter = _mapper.Map<GetChildListQuery, PaginationFilter>(request);

            var children = await _childRepository.ListAllAsync(paginationFilter);
            return _mapper.Map<List<ChildListVM>>(children);
        }
    }
}
