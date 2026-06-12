using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Identity;
using KDVManager.Services.CRM.Application.Exceptions;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Commands.DeleteAdministrator;

public class DeleteAdministratorCommandHandler
{
    private readonly IAuth0ManagementService _auth0;
    private readonly IOrganizationContext _organizationContext;

    public DeleteAdministratorCommandHandler(IAuth0ManagementService auth0, IOrganizationContext organizationContext)
    {
        _auth0 = auth0;
        _organizationContext = organizationContext;
    }

    public async Task Handle(DeleteAdministratorCommand command, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(command.UserId))
            throw new BadRequestException("A user id is required.");

        var organizationId = _organizationContext.OrganizationId;

        // An administrator may not delete their own account (prevents accidental lock-out).
        if (string.Equals(command.UserId, _organizationContext.CurrentUserId, StringComparison.Ordinal))
            throw new BadRequestException("You cannot delete your own administrator account.");

        // Tenant scoping: only members of the caller's organization can be deleted.
        var members = await _auth0.GetOrganizationMembersAsync(organizationId, cancellationToken);
        var isMember = members.Any(m => string.Equals(m.UserId, command.UserId, StringComparison.Ordinal));
        if (!isMember)
            throw new NotFoundException("Administrator", command.UserId);

        // Never remove the last remaining administrator of an organization.
        if (members.Count <= 1)
            throw new ConflictException("Administrator", command.UserId);

        await _auth0.DeleteUserAsync(command.UserId, cancellationToken);
    }
}
