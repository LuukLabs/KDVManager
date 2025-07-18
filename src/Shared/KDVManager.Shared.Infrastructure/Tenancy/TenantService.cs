using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using KDVManager.Shared.Domain.Services;
using KDVManager.Shared.Domain.Tenancy;
using Microsoft.AspNetCore.Http;

namespace KDVManager.Shared.Infrastructure.Tenancy;

/// <summary>
/// Unified tenant service that provides a single API for getting tenant information
/// Works for both HTTP requests (API controllers) and MassTransit consumers
/// </summary>
public class TenantService : ITenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ITenantContext _tenantContext;

    public TenantService(IHttpContextAccessor httpContextAccessor, ITenantContext tenantContext)
    {
        _httpContextAccessor = httpContextAccessor;
        _tenantContext = tenantContext;
    }

    private bool TryGetTenantFromClaims(IEnumerable<Claim> claims, out Guid tenant)
    {
        tenant = Guid.Empty;

        var tenantClaim = claims.FirstOrDefault(c => c.Type == "https://kdvmanager.nl/tenant");

        if (tenantClaim != null)
            return Guid.TryParse(tenantClaim.Value, out tenant);

        return false;
    }

    public Guid CurrentTenant
    {
        get
        {
            var tenant = TryGetCurrentTenant();
            if (tenant.HasValue)
            {
                return tenant.Value;
            }

            throw new TenantRequiredException("No tenant found in current context (HTTP or MassTransit)");
        }
    }

    public Guid? TryGetCurrentTenant()
    {
        // First, try to get tenant from MassTransit context (for consumers)
        if (_tenantContext.HasTenant)
        {
            return _tenantContext.TenantId;
        }

        // Fallback to HTTP context (for API controllers)
        if (_httpContextAccessor.HttpContext != null &&
            TryGetTenantFromClaims(_httpContextAccessor.HttpContext.User.Claims, out var tenant))
        {
            return tenant;
        }

        return null;
    }

    public void ValidateTenant(Guid expectedTenantId)
    {
        var currentTenant = CurrentTenant;
        if (currentTenant != expectedTenantId)
        {
            throw new UnauthorizedAccessException($"Tenant mismatch. Expected: {expectedTenantId}, Current: {currentTenant}");
        }
    }
}
