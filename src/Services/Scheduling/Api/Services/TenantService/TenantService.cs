using System;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using KDVManager.Services.Scheduling.Application.Exceptions;

namespace KDVManager.Services.Scheduling.Api.Services;


public class TenantService : ITenantService
{
    private IHttpContextAccessor _httpContextAccessor;

    public TenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private bool TryGetTenantFromClaims(IEnumerable<System.Security.Claims.Claim> claims, out Guid tenant)
    {
        tenant = Guid.Empty;

        var tenantClaim = claims.Where(c => c.Type == "https://kdvmanager.nl/tenant").FirstOrDefault();

        if (tenantClaim != null)
            return Guid.TryParse(tenantClaim.Value, out tenant);

        return false;
    }

    public Guid Tenant
    {
        get
        {
            var tenant = Guid.Empty;

            if (_httpContextAccessor.HttpContext != null && TryGetTenantFromClaims(_httpContextAccessor.HttpContext.User.Claims, out tenant))
            {
                return tenant;
            }
            else
            {
                throw new TenantRequiredException();
            }
        }
    }
}
