using System;
using System.Collections.Generic;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianList
{
    public class GetGuardianListQuery
    {
        public string? Search { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 25;
    }
}
