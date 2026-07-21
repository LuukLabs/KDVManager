using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.TenantManagement.Application.Contracts.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace KDVManager.Services.TenantManagement.Infrastructure.Identity;

/// <summary>
/// Writes the app-owned tenant id to the user's Auth0 <c>app_metadata.tenant_id</c>
/// via the Management API. A post-login Auth0 Action then copies that value into the
/// tenant claim on the access token. Registered as a singleton so the Management API
/// token is cached across requests.
/// </summary>
public class Auth0IdentityProvisioningService : IIdentityProvisioningService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly Auth0ManagementOptions _options;
    private readonly ILogger<Auth0IdentityProvisioningService> _logger;

    private readonly SemaphoreSlim _tokenLock = new(1, 1);
    private string? _cachedToken;
    private DateTimeOffset _tokenExpiresAt = DateTimeOffset.MinValue;

    public Auth0IdentityProvisioningService(
        IHttpClientFactory httpClientFactory,
        IOptions<Auth0ManagementOptions> options,
        ILogger<Auth0IdentityProvisioningService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SetTenantAsync(string userId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        var token = await GetManagementTokenAsync(cancellationToken);
        var client = _httpClientFactory.CreateClient();

        using var request = new HttpRequestMessage(
            HttpMethod.Patch,
            $"https://{_options.Domain}/api/v2/users/{Uri.EscapeDataString(userId)}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(new
        {
            app_metadata = new { tenant_id = tenantId.ToString() }
        });

        using var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError(
                "Failed to set Auth0 app_metadata for user {UserId}: {StatusCode} {Body}",
                userId, (int)response.StatusCode, body);
            response.EnsureSuccessStatusCode();
        }

        _logger.LogInformation("Set Auth0 tenant {TenantId} for user {UserId}", tenantId, userId);
    }

    private async Task<string> GetManagementTokenAsync(CancellationToken cancellationToken)
    {
        if (_cachedToken is not null && DateTimeOffset.UtcNow < _tokenExpiresAt)
            return _cachedToken;

        await _tokenLock.WaitAsync(cancellationToken);
        try
        {
            if (_cachedToken is not null && DateTimeOffset.UtcNow < _tokenExpiresAt)
                return _cachedToken;

            var client = _httpClientFactory.CreateClient();
            using var response = await client.PostAsJsonAsync(
                $"https://{_options.Domain}/oauth/token",
                new
                {
                    client_id = _options.ManagementClientId,
                    client_secret = _options.ManagementClientSecret,
                    audience = $"https://{_options.Domain}/api/v2/",
                    grant_type = "client_credentials",
                },
                cancellationToken);
            response.EnsureSuccessStatusCode();

            var payload = await response.Content.ReadFromJsonAsync<TokenResponse>(cancellationToken)
                ?? throw new InvalidOperationException("Empty token response from Auth0.");

            _cachedToken = payload.access_token;
            // Refresh a minute early to avoid using a token that expires mid-request.
            _tokenExpiresAt = DateTimeOffset.UtcNow.AddSeconds(Math.Max(0, payload.expires_in - 60));
            return _cachedToken!;
        }
        finally
        {
            _tokenLock.Release();
        }
    }

    private sealed class TokenResponse
    {
        public string access_token { get; set; } = string.Empty;
        public int expires_in { get; set; }
    }
}
