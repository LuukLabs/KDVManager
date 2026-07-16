using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Common;
using KDVManager.Services.TenantManagement.Application.Contracts.Persistence;
using KDVManager.Shared.Contracts.Events;
using KDVManager.Shared.Contracts.Tenancy;
using MassTransit;

namespace KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.DeleteTenant;

/// <summary>
/// Deletes a tenant and its memberships, then publishes <see cref="TenantDeletedEvent"/>
/// so other services drop the tenant from their read models. The tenant's business
/// data in those services is not purged here — that is future business logic.
/// </summary>
public class DeleteTenantCommandHandler
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IMembershipRepository _membershipRepository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ITenancyContextAccessor _tenancyContextAccessor;

    public DeleteTenantCommandHandler(
        ITenantRepository tenantRepository,
        IMembershipRepository membershipRepository,
        IPublishEndpoint publishEndpoint,
        ITenancyContextAccessor tenancyContextAccessor)
    {
        _tenantRepository = tenantRepository;
        _membershipRepository = membershipRepository;
        _publishEndpoint = publishEndpoint;
        _tenancyContextAccessor = tenancyContextAccessor;
    }

    /// <summary>Returns false when the tenant does not exist.</summary>
    public async Task<bool> Handle(DeleteTenantCommand command, CancellationToken cancellationToken = default)
    {
        var tenant = await _tenantRepository.GetByIdAsync(command.TenantId, cancellationToken);
        if (tenant is null)
            return false;

        await _membershipRepository.DeleteByTenantIdAsync(tenant.Id, cancellationToken);
        await _tenantRepository.DeleteAsync(tenant, cancellationToken);

        // Publish under the *target* tenant's ambient context so the publish filter
        // stamps its TenantId header (the admin's own claim is a different tenant).
        _tenancyContextAccessor.Current = new AmbientTenantContext(tenant.Id);

        await _publishEndpoint.Publish(new TenantDeletedEvent(), cancellationToken);

        return true;
    }
}
