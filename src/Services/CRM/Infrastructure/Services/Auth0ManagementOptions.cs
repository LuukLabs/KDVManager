namespace KDVManager.Services.CRM.Infrastructure.Services;

public class Auth0ManagementOptions
{
    /// <summary>Auth0 tenant domain, e.g. "kdvmanager.eu.auth0.com".</summary>
    public string Domain { get; set; } = string.Empty;

    /// <summary>Client id of the Auth0 Machine-to-Machine application authorized for the Management API.</summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>Client secret of the Auth0 Machine-to-Machine application authorized for the Management API.</summary>
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>Database connection new administrators are created in.</summary>
    public string Connection { get; set; } = "Username-Password-Authentication";
}
