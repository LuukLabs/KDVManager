namespace KDVManager.Services.CRM.Application.Features.Administrators.Commands.RevokeInvitation;

public class RevokeInvitationCommand
{
    /// <summary>Auth0 organization invitation id to revoke.</summary>
    public string InvitationId { get; set; } = string.Empty;
}
