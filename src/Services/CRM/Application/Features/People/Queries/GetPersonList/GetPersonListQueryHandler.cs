using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.CRM.Application.Contracts.Infrastructure;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Services.CRM.Domain.Entities;
using MediatR;

namespace KDVManager.Services.CRM.Application.Features.People.Queries.GetPersonList
{
    public class GetPersonListQueryHandler : IRequestHandler<GetPersonListQuery, PagedList<PersonListVM>>
    {
        private readonly IPersonRepository _personRepository;
        private readonly IMapper _mapper;

        public GetPersonListQueryHandler(IMapper mapper, IPersonRepository personRepository)
        {
            _personRepository = personRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<PersonListVM>> Handle(GetPersonListQuery request, CancellationToken cancellationToken)
        {
            var children = await _personRepository.PagedAsync(request);
            var count = await _personRepository.CountAsync();

            List<PersonListVM> personListVMs = _mapper.Map<List<PersonListVM>>(children);

            return new PagedList<PersonListVM>(personListVMs, count);
        }
    }
}
