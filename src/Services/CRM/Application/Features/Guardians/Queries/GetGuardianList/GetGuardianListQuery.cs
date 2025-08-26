using System;
using System.Collections.Generic;
using KDVManager.Services.CRM.Application.Contracts.Pagination;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianList
{
    public class GetGuardianListQuery : PageParameters
    {
        public string? Search { get; set; }
    }
}
