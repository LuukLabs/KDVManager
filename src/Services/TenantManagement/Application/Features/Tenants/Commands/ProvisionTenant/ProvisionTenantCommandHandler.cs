using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Common;
using KDVManager.Services.TenantManagement.Application.Contracts.Identity;
using KDVManager.Services.TenantManagement.Application.Contracts.Persistence;
using KDVManager.Services.TenantManagement.Domain.Entities;
using KDVManager.Services.TenantManagement.Domain.Enums;
using KDVManager.Shared.Contracts.Events;
using KDVManager.Shared.Contracts.Tenancy;
using MassTransit;

namespace KDVManager.Services.TenantManagement.Application.Features.Tenants.Commands.ProvisionTenant;

/// <summary>
/// Provisions a tenant for the current user. Idempotent: if the user already has a
/// membership, the existing tenant is returned. Whether new or existing, the tenant
/// id is (re-)propagated to the identity provider so a token refresh carries the
/// tenant claim — this also self-heals a previous partial provision.
/// </summary>
public class ProvisionTenantCommandHandler
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IIdentityProvisioningService _identityProvisioning;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public ProvisionTenantCommandHandler(
        ITenantRepository tenantRepository,
        IMembershipRepository membershipRepository,
        ICurrentUserService currentUser,
        IIdentityProvisioningService identityProvisioning,
        IPublishEndpoint publishEndpoint,
        ITenancyContextAccessor tenancyContextAccessor)
    {
        _tenantRepository = tenantRepository;
        _membershipRepository = membershipRepository;
        _currentUser = currentUser;
        _identityProvisioning = identityProvisioning;
        _publishEndpoint = publishEndpoint;
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    public async Task<TenantVM> Handle(ProvisionTenantCommand command, CancellationToken cancellationToken = default)
    {
        var userId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("No authenticated user.");

        var existing = await _membershipRepository.GetByUserIdAsync(userId, cancellationToken);
        if (existing is not null)
        {
            var existingTenant = await _tenantRepository.GetByIdAsync(existing.TenantId, cancellationToken)
                ?? throw new InvalidOperationException($"Membership {existing.Id} references missing tenant {existing.TenantId}.");

            // Self-heal: ensure the identity provider has the tenant id even if a
            // previous attempt failed after the records were written.
            await _identityProvisioning.SetTenantAsync(userId, existingTenant.Id, cancellationToken);

            return ToVM(existingTenant, existing.Role);
        }

        var now = DateTime.UtcNow;
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = command.Name.Trim(),
            TrialStartDate = now,
            CreatedAt = now,
        };
        await _tenantRepository.AddAsync(tenant, cancellationToken);

        var membership = new Membership
        {
            Id = Guid.NewGuid(),
            TenantId = tenant.Id,
            UserId = userId,
            Role = TenantRole.Owner,
            CreatedAt = now,
        };
        await _membershipRepository.AddAsync(membership, cancellationToken);

        // Establish the ambient tenant so the publish filter stamps the TenantId
        // header (the request has no tenant claim yet during onboarding).
        _tenancyContextAccessor.Current = new AmbientTenantContext(tenant.Id);

        await _publishEndpoint.Publish(
            new TenantRegisteredEvent { TrialStartDate = tenant.TrialStartDate },
            cancellationToken);

        await _identityProvisioning.SetTenantAsync(userId, tenant.Id, cancellationToken);

        return ToVM(tenant, membership.Role);
    }

    private static TenantVM ToVM(Tenant tenant, TenantRole role) => new()
    {
        Id = tenant.Id,
        Name = tenant.Name,
        Role = role,
        TrialStartDate = tenant.TrialStartDate,
    };
}
