using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Auth0.AuthenticationApi;
using Auth0.AuthenticationApi.Models;
using Auth0.Core.Exceptions;
using Auth0.ManagementApi;
using Auth0.ManagementApi.Models;
using KDVManager.Services.CRM.Application.Contracts.Services;
using KDVManager.Services.CRM.Application.Exceptions;
using KDVManager.Services.CRM.Domain.Entities;
using Microsoft.Extensions.Options;

namespace KDVManager.Services.CRM.Infrastructure.Services;

public class Auth0ManagementService : IAuth0ManagementService
{
    private readonly Auth0ManagementOptions _options;

    public Auth0ManagementService(IOptions<Auth0ManagementOptions> options)
    {
        _options = options.Value;
    }

    public async Task<string> CreateUserAsync(string email, string name, Guid tenantId, CancellationToken cancellationToken = default)
    {
        using var managementClient = await CreateManagementClientAsync(cancellationToken);

        User createdUser;
        try
        {
            createdUser = await managementClient.Users.CreateAsync(new UserCreateRequest
            {
                Connection = _options.Connection,
                Email = email,
                EmailVerified = false,
                Password = GenerateTemporaryPassword(),
                FullName = name,
                AppMetadata = new { tenant_id = tenantId },
            }, cancellationToken);
        }
        catch (ErrorApiException ex) when (ex.StatusCode == HttpStatusCode.Conflict)
        {
            throw new ConflictException(nameof(Administrator), email);
        }

        // Triggers Auth0's built-in "change password" email so the administrator sets their
        // own password; the temporary password above never leaves this method.
        using var authenticationClient = new AuthenticationApiClient(_options.Domain);
        await authenticationClient.ChangePasswordAsync(new ChangePasswordRequest
        {
            ClientId = _options.ClientId,
            Email = email,
            Connection = _options.Connection,
        }, cancellationToken);

        return createdUser.UserId;
    }

    public async Task DeleteUserAsync(string auth0UserId, CancellationToken cancellationToken = default)
    {
        using var managementClient = await CreateManagementClientAsync(cancellationToken);
        await managementClient.Users.DeleteAsync(auth0UserId);
    }

    private async Task<ManagementApiClient> CreateManagementClientAsync(CancellationToken cancellationToken)
    {
        using var authenticationClient = new AuthenticationApiClient(_options.Domain);
        var tokenResult = await authenticationClient.GetTokenAsync(new ClientCredentialsTokenRequest
        {
            ClientId = _options.ClientId,
            ClientSecret = _options.ClientSecret,
            Audience = $"https://{_options.Domain}/api/v2/",
        }, cancellationToken);

        return new ManagementApiClient(tokenResult.AccessToken, _options.Domain);
    }

    private static string GenerateTemporaryPassword()
    {
        // Auth0 requires a password on creation even though the administrator never sees it.
        return $"{Guid.NewGuid():N}{Guid.NewGuid():N}Aa1!";
    }
}
