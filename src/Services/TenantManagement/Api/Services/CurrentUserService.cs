using System.Security.Claims;
using KDVManager.Services.TenantManagement.Application.Contracts.Identity;
using Microsoft.AspNetCore.Http;

namespace KDVManager.Services.TenantManagement.Api.Services;

/// <summary>
/// Reads the authenticated identity from the access token on the current request.
/// JwtBearer maps the JWT <c>sub</c> to <see cref="ClaimTypes.NameIdentifier"/> by
/// default; we fall back to the raw "sub"/"email" claim names to be robust to
/// inbound-claim-mapping configuration.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public string? UserId =>
        User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? User?.FindFirst("sub")?.Value;

    public string? Email =>
        User?.FindFirst(ClaimTypes.Email)?.Value
        ?? User?.FindFirst("email")?.Value;
}
