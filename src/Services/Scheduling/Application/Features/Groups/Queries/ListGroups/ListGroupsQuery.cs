﻿using System;
using System.Collections.Generic;
using KDVManager.Services.Scheduling.Domain;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Queries.ListGroups;

public class ListGroupsQuery : PageParameters, IRequest<PagedList<GroupListVM>>
{
}

