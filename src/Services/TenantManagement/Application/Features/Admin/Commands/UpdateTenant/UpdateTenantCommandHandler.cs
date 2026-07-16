using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Contracts.Persistence;

namespace KDVManager.Services.TenantManagement.Application.Features.Admin.Commands.UpdateTenant;

/// <summary>
/// Changes a tenant's organization details (name, invoice address). No event is
/// published: other services don't hold these fields in their read models yet.
/// </summary>
public class UpdateTenantCommandHandler
{
    private readonly ITenantRepository _tenantRepository;

    public UpdateTenantCommandHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    /// <summary>Returns the updated tenant, or null when it does not exist.</summary>
    public async Task<AdminTenantVM?> Handle(UpdateTenantCommand command, CancellationToken cancellationToken = default)
    {
        var tenant = await _tenantRepository.GetByIdAsync(command.TenantId, cancellationToken);
        if (tenant is null)
            return null;

        tenant.Name = command.Name.Trim();
        tenant.InvoiceAddress = string.IsNullOrWhiteSpace(command.InvoiceAddress)
            ? null
            : command.InvoiceAddress.Trim();
        await _tenantRepository.UpdateAsync(tenant, cancellationToken);

        return AdminTenantVM.FromTenant(tenant);
    }
}
