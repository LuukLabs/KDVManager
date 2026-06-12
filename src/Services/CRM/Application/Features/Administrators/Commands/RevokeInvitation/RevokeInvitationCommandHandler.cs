using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Identity;
using KDVManager.Services.CRM.Application.Exceptions;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Commands.RevokeInvitation;

public class RevokeInvitationCommandHandler
{
    private readonly IAuth0ManagementService _auth0;
    private readonly IOrganizationContext _organizationContext;

    public RevokeInvitationCommandHandler(IAuth0ManagementService auth0, IOrganizationContext organizationContext)
    {
        _auth0 = auth0;
        _organizationContext = organizationContext;
    }

    public async Task Handle(RevokeInvitationCommand command, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(command.InvitationId))
            throw new BadRequestException("An invitation id is required.");

        var organizationId = _organizationContext.OrganizationId;

        // Tenant scoping: the invitation must belong to the caller's organization.
        var invitations = await _auth0.GetPendingInvitationsAsync(organizationId, cancellationToken);
        if (!invitations.Any(i => string.Equals(i.Id, command.InvitationId, StringComparison.Ordinal)))
            throw new NotFoundException("Invitation", command.InvitationId);

        await _auth0.DeleteInvitationAsync(organizationId, command.InvitationId, cancellationToken);
    }
}
