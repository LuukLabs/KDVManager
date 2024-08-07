﻿using KDVManager.Services.CRM.Application.Contracts.Pagination;
using MediatR;

namespace KDVManager.Services.CRM.Application.Features.People.Queries.GetPersonList;

public class GetPersonListQuery : PageParameters, IRequest<PagedList<PersonListVM>>
{
}
