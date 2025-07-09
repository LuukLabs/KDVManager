using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Application.Contracts.Pagination;

namespace KDVManager.Services.CRM.Application.Features.People.Queries.GetPersonList;

public class GetPersonListQueryHandler
{
    private readonly IPersonRepository _personRepository;

    public GetPersonListQueryHandler(IPersonRepository personRepository)
    {
        _personRepository = personRepository;
    }

    public async Task<PagedList<PersonListVM>> Handle(GetPersonListQuery request)
    {
        var people = await _personRepository.PagedAsync(request);
        var count = await _personRepository.CountAsync();

        List<PersonListVM> personListVMs = people.Select(person => new PersonListVM
        {
            Id = person.Id,
            FullName = (person.GivenName + " " + person.FamilyName).Trim(),
            Email = person.Email,
            PhoneNumber = person.PhoneNumber
        }).ToList();

        return new PagedList<PersonListVM>(personListVMs, count);
    }
}
