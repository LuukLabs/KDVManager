using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.AspNetCore.Http;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public class JwtTenancyResolver : ITenancyResolver
{
    private readonly IHttpContextAccessor _http;
    public JwtTenancyResolver(IHttpContextAccessor http) => _http = http;

    public Guid? ResolveTenantId()
    {
        var claims = _http.HttpContext?.User?.Claims;
        if (claims == null)
            return null;

        var tenantClaim = claims.FirstOrDefault(c => c.Type == "https://kdvmanager.nl/tenant");
        return tenantClaim != null && Guid.TryParse(tenantClaim.Value, out var guid) ? guid : null;
    }
}