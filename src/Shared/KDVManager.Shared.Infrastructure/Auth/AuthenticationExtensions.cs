using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace KDVManager.Shared.Infrastructure.Auth;

public static class AuthenticationExtensions
{
    /// <summary>
    /// Configures Auth0 JWT bearer authentication with hardened token validation and a
    /// fallback authorization policy requiring an authenticated caller that carries a
    /// tenant claim. Endpoints that must stay public (e.g. health checks) opt out with
    /// AllowAnonymous.
    /// </summary>
    public static IServiceCollection AddKdvManagerAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        // Auth0:Authority overrides the Auth0:Domain-derived authority (lets e2e tests point at a local mock issuer)
        string authority = configuration["Auth0:Authority"] ?? $"https://{configuration["Auth0:Domain"]}/";

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = authority;
                options.Audience = configuration["Auth0:Audience"];
                options.RequireHttpsMetadata = authority.StartsWith("https://", StringComparison.OrdinalIgnoreCase);
                options.SaveToken = false;
                options.IncludeErrorDetails = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ClockSkew = TimeSpan.FromMinutes(5),
                    RequireExpirationTime = true,
                    RequireSignedTokens = true
                };

                options.Events = new JwtBearerEvents
                {
                    // Surface why a token was rejected (expired, bad issuer, ...) without
                    // logging the token itself.
                    OnAuthenticationFailed = context =>
                    {
                        var logger = context.HttpContext.RequestServices
                            .GetRequiredService<ILoggerFactory>()
                            .CreateLogger("JwtAuthentication");
                        logger.LogWarning(context.Exception, "JWT authentication failed for {RequestPath}",
                            SanitizeForLog(context.HttpContext.Request.Path.Value));
                        return Task.CompletedTask;
                    }
                };
            });

        services.AddAuthorization(options =>
        {
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .RequireClaim(TenancyClaimTypes.TenantId)
                .Build();
        });

        return services;
    }

    /// <summary>
    /// The request path is user input: strip CR/LF so a crafted path cannot forge log
    /// entries, and cap the length to keep abuse out of the log volume.
    /// </summary>
    private static string SanitizeForLog(string? value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;
        var sanitized = value.Replace("\r", "").Replace("\n", "");
        return sanitized.Length <= 200 ? sanitized : sanitized[..200];
    }
}
