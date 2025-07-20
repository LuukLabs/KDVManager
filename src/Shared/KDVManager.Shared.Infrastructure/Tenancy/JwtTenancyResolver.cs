using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.AspNetCore.Http;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public class JwtTenancyResolver : ITenancyResolver
{
    private readonly IHttpContextAccessor _http;
    private readonly ITenancyContextAccessor _accessor;

    public JwtTenancyResolver(IHttpContextAccessor http, ITenancyContextAccessor accessor)
    {
        _http = http;
        _accessor = accessor;
    }

    public ITenancyContext Resolve()
    {
        var claims = _http.HttpContext?.User?.Claims;
        if (claims == null)
            return null;

        var tenantClaim = claims.FirstOrDefault(c => c.Type == "https://kdvmanager.nl/tenant");
        return tenantClaim != null && Guid.TryParse(tenantClaim.Value, out var guid)
            ? new StaticTenancyContext(guid)
            : null;
    }
}