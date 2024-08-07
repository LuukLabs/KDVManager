﻿using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using MediatR;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList;

public class GetChildListQueryHandler : IRequestHandler<GetChildListQuery, PagedList<ChildListVM>>
{
    private readonly IChildRepository _childRepository;
    private readonly IMapper _mapper;

    public GetChildListQueryHandler(IMapper mapper, IChildRepository childRepository)
    {
        _childRepository = childRepository;
        _mapper = mapper;
    }

    public async Task<PagedList<ChildListVM>> Handle(GetChildListQuery request, CancellationToken cancellationToken)
    {
        var children = await _childRepository.PagedAsync(request, request.Search);
        var count = await _childRepository.CountAsync();

        List<ChildListVM> childListVMs = _mapper.Map<List<ChildListVM>>(children);

        return new PagedList<ChildListVM>(childListVMs, count);
    }
}
