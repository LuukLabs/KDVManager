using System;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace KDVManager.Services.Scheduling.Api.Services;

public class TenantService : ITenantService
{
    public TenantService(IHttpContextAccessor httpContextAccessor)
    {
        if (TryGetTenantHeader(httpContextAccessor.HttpContext.Request.Headers, out Guid tenantId))
        {
            TenantId = tenantId;
        }
    }

    private bool TryGetTenantHeader(IHeaderDictionary headers, out Guid tenantId)
    {
        tenantId = Guid.Empty;

        if (headers.TryGetValue("x-tenant-id", out var tenantIdHeader))
        {
            return Guid.TryParse(tenantIdHeader, out tenantId);
        }

        return false;
    }

    public Guid TenantId { get; private set; }
}
