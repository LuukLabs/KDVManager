using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Identity;
using KDVManager.Services.CRM.Application.Exceptions;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Commands.InviteAdministrator;

public class InviteAdministratorCommandHandler
{
    private readonly IAuth0ManagementService _auth0;
    private readonly IOrganizationContext _organizationContext;

    public InviteAdministratorCommandHandler(IAuth0ManagementService auth0, IOrganizationContext organizationContext)
    {
        _auth0 = auth0;
        _organizationContext = organizationContext;
    }

    public async Task Handle(InviteAdministratorCommand command, CancellationToken cancellationToken = default)
    {
        var validator = new InviteAdministratorCommandValidator();
        var validationResult = await validator.ValidateAsync(command, cancellationToken);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var organizationId = _organizationContext.OrganizationId;
        var email = command.Email.Trim();

        // Reject duplicates: already an active member or already invited.
        var members = await _auth0.GetOrganizationMembersAsync(organizationId, cancellationToken);
        if (members.Any(m => string.Equals(m.Email, email, StringComparison.OrdinalIgnoreCase)))
            throw new ConflictException("Administrator", email);

        var invitations = await _auth0.GetPendingInvitationsAsync(organizationId, cancellationToken);
        if (invitations.Any(i => string.Equals(i.InviteeEmail, email, StringComparison.OrdinalIgnoreCase)))
            throw new ConflictException("Invitation", email);

        await _auth0.CreateInvitationAsync(organizationId, _organizationContext.CurrentUserName, email, cancellationToken);
    }
}
