namespace KDVManager.Services.CRM.Application.Features.Administrators.Commands.DeleteAdministrator;

public class DeleteAdministratorCommand
{
    /// <summary>Auth0 user id (sub) of the administrator to delete.</summary>
    public string UserId { get; set; } = string.Empty;
}
