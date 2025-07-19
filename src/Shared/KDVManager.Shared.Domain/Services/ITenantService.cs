using System;

namespace KDVManager.Shared.Domain.Services;

/// <summary>
/// Unified domain service for tenant operations
/// Provides a single API for getting tenant information from multiple sources
/// (HTTP context for API requests, TenantContext for MassTransit consumers)
/// </summary>
public interface ITenantService
{
    /// <summary>
    /// Gets the current tenant ID from the appropriate source
    /// (HTTP context for API requests, TenantContext for message consumers)
    /// </summary>
    /// <exception cref="TenantRequiredException">Thrown when no tenant is available</exception>
    Guid CurrentTenant { get; }

    /// <summary>
    /// Tries to get the current tenant ID without throwing an exception
    /// </summary>
    /// <returns>The tenant ID if available, null otherwise</returns>
    Guid? TryGetCurrentTenant();

    /// <summary>
    /// Validates that the current tenant matches the expected tenant
    /// </summary>
    /// <param name="expectedTenantId">The expected tenant ID</param>
    /// <exception cref="UnauthorizedAccessException">Thrown when tenant doesn't match</exception>
    void ValidateTenant(Guid expectedTenantId);
}
