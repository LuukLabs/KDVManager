using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Identity;
using KDVManager.Services.CRM.Infrastructure.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace KDVManager.Services.CRM.Infrastructure.Services;

/// <summary>
/// Auth0 Management API client. Acquires a Management API access token via the
/// client-credentials grant and caches it (tokens are valid ~24h) so it is reused
/// across requests.
/// </summary>
public class Auth0ManagementService : IAuth0ManagementService
{
    private const string TokenCacheKey = "auth0:management:token";
    private static readonly SemaphoreSlim TokenLock = new(1, 1);

    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly Auth0ManagementOptions _options;

    public Auth0ManagementService(HttpClient httpClient, IMemoryCache cache, IOptions<Auth0ManagementOptions> options)
    {
        _httpClient = httpClient;
        _cache = cache;
        _options = options.Value;
    }

    private string BaseUrl => $"https://{_options.Domain}";

    public async Task<IReadOnlyList<Auth0OrganizationMember>> GetOrganizationMembersAsync(string organizationId, CancellationToken cancellationToken = default)
    {
        // Administrator lists are small; a single page of 100 is sufficient.
        var url = $"{BaseUrl}/api/v2/organizations/{Uri.EscapeDataString(organizationId)}/members?per_page=100&page=0";
        using var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, url, cancellationToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var members = await response.Content.ReadFromJsonAsync<List<MemberDto>>(cancellationToken) ?? new();
        return members
            .Select(m => new Auth0OrganizationMember(m.UserId ?? string.Empty, m.Email, m.Name, m.Picture))
            .ToList();
    }

    public async Task<IReadOnlyList<Auth0OrganizationInvitation>> GetPendingInvitationsAsync(string organizationId, CancellationToken cancellationToken = default)
    {
        var url = $"{BaseUrl}/api/v2/organizations/{Uri.EscapeDataString(organizationId)}/invitations?per_page=100&page=0";
        using var request = await CreateAuthorizedRequestAsync(HttpMethod.Get, url, cancellationToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var invitations = await response.Content.ReadFromJsonAsync<List<InvitationDto>>(cancellationToken) ?? new();
        return invitations
            .Select(i => new Auth0OrganizationInvitation(
                i.Id ?? string.Empty,
                i.Invitee?.Email,
                i.Inviter?.Name,
                i.CreatedAt,
                i.ExpiresAt))
            .ToList();
    }

    public async Task CreateInvitationAsync(string organizationId, string inviterName, string inviteeEmail, CancellationToken cancellationToken = default)
    {
        var url = $"{BaseUrl}/api/v2/organizations/{Uri.EscapeDataString(organizationId)}/invitations";
        var body = new CreateInvitationRequest
        {
            Inviter = new InviterDto { Name = string.IsNullOrWhiteSpace(inviterName) ? "KDVManager" : inviterName },
            Invitee = new InviteeDto { Email = inviteeEmail },
            ClientId = _options.InvitationClientId,
            ConnectionId = string.IsNullOrWhiteSpace(_options.InvitationConnectionId) ? null : _options.InvitationConnectionId,
            SendInvitationEmail = true,
        };

        using var request = await CreateAuthorizedRequestAsync(HttpMethod.Post, url, cancellationToken);
        request.Content = JsonContent.Create(body);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task<bool> IsMemberOfOrganizationAsync(string organizationId, string userId, CancellationToken cancellationToken = default)
    {
        var members = await GetOrganizationMembersAsync(organizationId, cancellationToken);
        return members.Any(m => string.Equals(m.UserId, userId, StringComparison.Ordinal));
    }

    public async Task DeleteUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var url = $"{BaseUrl}/api/v2/users/{Uri.EscapeDataString(userId)}";
        using var request = await CreateAuthorizedRequestAsync(HttpMethod.Delete, url, cancellationToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    public async Task DeleteInvitationAsync(string organizationId, string invitationId, CancellationToken cancellationToken = default)
    {
        var url = $"{BaseUrl}/api/v2/organizations/{Uri.EscapeDataString(organizationId)}/invitations/{Uri.EscapeDataString(invitationId)}";
        using var request = await CreateAuthorizedRequestAsync(HttpMethod.Delete, url, cancellationToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    private async Task<HttpRequestMessage> CreateAuthorizedRequestAsync(HttpMethod method, string url, CancellationToken cancellationToken)
    {
        var token = await GetManagementTokenAsync(cancellationToken);
        var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return request;
    }

    private async Task<string> GetManagementTokenAsync(CancellationToken cancellationToken)
    {
        if (_cache.TryGetValue(TokenCacheKey, out string? cached) && !string.IsNullOrEmpty(cached))
            return cached;

        await TokenLock.WaitAsync(cancellationToken);
        try
        {
            if (_cache.TryGetValue(TokenCacheKey, out cached) && !string.IsNullOrEmpty(cached))
                return cached;

            var tokenRequest = new TokenRequest
            {
                ClientId = _options.ManagementClientId,
                ClientSecret = _options.ManagementClientSecret,
                Audience = $"{BaseUrl}/api/v2/",
                GrantType = "client_credentials",
            };

            using var response = await _httpClient.PostAsJsonAsync($"{BaseUrl}/oauth/token", tokenRequest, cancellationToken);
            response.EnsureSuccessStatusCode();

            var token = await response.Content.ReadFromJsonAsync<TokenResponse>(cancellationToken)
                ?? throw new InvalidOperationException("Auth0 token endpoint returned an empty response.");

            // Refresh a minute early to avoid using a token that expires mid-request.
            var lifetime = TimeSpan.FromSeconds(Math.Max(60, token.ExpiresIn) - 60);
            _cache.Set(TokenCacheKey, token.AccessToken, lifetime);
            return token.AccessToken;
        }
        finally
        {
            TokenLock.Release();
        }
    }

    private sealed class TokenRequest
    {
        [JsonPropertyName("client_id")] public string ClientId { get; set; } = string.Empty;
        [JsonPropertyName("client_secret")] public string ClientSecret { get; set; } = string.Empty;
        [JsonPropertyName("audience")] public string Audience { get; set; } = string.Empty;
        [JsonPropertyName("grant_type")] public string GrantType { get; set; } = string.Empty;
    }

    private sealed class TokenResponse
    {
        [JsonPropertyName("access_token")] public string AccessToken { get; set; } = string.Empty;
        [JsonPropertyName("expires_in")] public int ExpiresIn { get; set; }
    }

    private sealed class MemberDto
    {
        [JsonPropertyName("user_id")] public string? UserId { get; set; }
        [JsonPropertyName("email")] public string? Email { get; set; }
        [JsonPropertyName("name")] public string? Name { get; set; }
        [JsonPropertyName("picture")] public string? Picture { get; set; }
    }

    private sealed class InvitationDto
    {
        [JsonPropertyName("id")] public string? Id { get; set; }
        [JsonPropertyName("inviter")] public InviterDto? Inviter { get; set; }
        [JsonPropertyName("invitee")] public InviteeDto? Invitee { get; set; }
        [JsonPropertyName("created_at")] public DateTimeOffset? CreatedAt { get; set; }
        [JsonPropertyName("expires_at")] public DateTimeOffset? ExpiresAt { get; set; }
    }

    private sealed class CreateInvitationRequest
    {
        [JsonPropertyName("inviter")] public InviterDto Inviter { get; set; } = new();
        [JsonPropertyName("invitee")] public InviteeDto Invitee { get; set; } = new();
        [JsonPropertyName("client_id")] public string ClientId { get; set; } = string.Empty;
        [JsonPropertyName("connection_id")] public string? ConnectionId { get; set; }
        [JsonPropertyName("send_invitation_email")] public bool SendInvitationEmail { get; set; }
    }

    private sealed class InviterDto
    {
        [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    }

    private sealed class InviteeDto
    {
        [JsonPropertyName("email")] public string Email { get; set; } = string.Empty;
    }
}
