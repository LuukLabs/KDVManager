using System;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Services.CRM.Application.Features.People.Commands.AddPerson;
using KDVManager.Services.CRM.Application.Features.People.Queries.GetPersonList;

namespace KDVManager.Services.CRM.Application.Services;

public interface IPersonService
{
    Task<PagedList<PersonListVM>> GetPersonListAsync(GetPersonListQuery query);
    Task<Guid> AddPersonAsync(AddPersonCommand command);
}
