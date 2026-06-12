using System;
using System.Linq;
using KDVManager.Services.CRM.Application.Contracts.Identity;
using Microsoft.AspNetCore.Http;

namespace KDVManager.Services.CRM.Infrastructure.Identity;

/// <summary>
/// Reads the current organization (tenant) and user from the validated JWT on the
/// ambient <see cref="HttpContext"/>. When Auth0 Organizations is enabled the access
/// token carries the <c>org_id</c> claim; <c>sub</c> is the user id.
/// </summary>
public class OrganizationContext : IOrganizationContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public OrganizationContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string OrganizationId =>
        GetClaim("org_id")
        ?? throw new InvalidOperationException("No organization (org_id) claim is present on the current token.");

    public string CurrentUserId =>
        GetClaim("sub")
        ?? throw new InvalidOperationException("No user (sub) claim is present on the current token.");

    public string CurrentUserName =>
        GetClaim("name")
        ?? GetClaim("email")
        ?? "KDVManager";

    private string? GetClaim(string type)
    {
        var value = _httpContextAccessor.HttpContext?.User?.Claims
            .FirstOrDefault(c => c.Type == type)?.Value;
        return string.IsNullOrWhiteSpace(value) ? null : value;
    }
}
