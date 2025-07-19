
using KDVManager.Services.CRM.Application.Exceptions;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Services.CRM.Api.Services;

public class TenantService : ITenancyContext
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

    public Guid TenantId
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
