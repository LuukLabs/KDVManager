using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Contracts.Identity;
using KDVManager.Services.TenantManagement.Application.Contracts.Persistence;

namespace KDVManager.Services.TenantManagement.Application.Features.Tenants.Queries.GetMyTenant;

public class GetMyTenantQueryHandler
{
    private readonly IMembershipRepository _membershipRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ICurrentUserService _currentUser;

    public GetMyTenantQueryHandler(
        IMembershipRepository membershipRepository,
        ITenantRepository tenantRepository,
        ICurrentUserService currentUser)
    {
        _membershipRepository = membershipRepository;
        _tenantRepository = tenantRepository;
        _currentUser = currentUser;
    }

    /// <summary>Returns the current user's tenant, or null when they have none (onboarding required).</summary>
    public async Task<TenantVM?> Handle(GetMyTenantQuery query, CancellationToken cancellationToken = default)
    {
        var userId = _currentUser.UserId
            ?? throw new UnauthorizedAccessException("No authenticated user.");

        var membership = await _membershipRepository.GetByUserIdAsync(userId, cancellationToken);
        if (membership is null)
            return null;

        var tenant = await _tenantRepository.GetByIdAsync(membership.TenantId, cancellationToken);
        if (tenant is null)
            return null;

        return new TenantVM
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Role = membership.Role,
            TrialStartDate = tenant.TrialStartDate,
        };
    }
}
