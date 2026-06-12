using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.CRM.Application.Features.Administrators.Queries.GetAdministratorList;

public class AdministratorListVM
{
    /// <summary>
    /// Auth0 user id (sub) for active members, or the invitation id for pending invitations.
    /// </summary>
    [property: Required]
    public required string Id { get; set; }

    [property: Required]
    public required string Email { get; set; }

    public string? Name { get; set; }

    public string? Picture { get; set; }

    /// <summary>"Active" for organization members, "Pending" for outstanding invitations.</summary>
    [property: Required]
    public required string Status { get; set; }
}
