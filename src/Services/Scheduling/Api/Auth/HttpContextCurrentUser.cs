using System.Security.Claims;
using KDVManager.Services.Scheduling.Application.Contracts.Services;

namespace KDVManager.Services.Scheduling.Api.Auth;

public sealed class HttpContextCurrentUser(IHttpContextAccessor httpContextAccessor) : ICurrentUser
{
    public string Subject =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? httpContextAccessor.HttpContext?.User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException("Authenticated user subject is required.");
}
