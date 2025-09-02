using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace KDVManager.Shared.Infrastructure.Middleware;

public class CorrelationIdMiddleware
{
    private const string HeaderName = "X-Request-ID";
    private readonly RequestDelegate _next;
    private readonly ILogger<CorrelationIdMiddleware> _logger;

    public CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = GetOrCreateCorrelationId(context);

        // Attach to Activity for tracing correlation
        var activity = Activity.Current;
        activity?.SetTag("request.id", correlationId);

        using (_logger.BeginScope(new Dictionary<string, object>
               {
                   {"request.id", correlationId}
               }))
        {
            context.Response.OnStarting(() =>
            {
                if (!context.Response.Headers.ContainsKey(HeaderName))
                {
                    context.Response.Headers.Add(HeaderName, correlationId);
                }
                return Task.CompletedTask;
            });

            await _next(context);
        }
    }

    private static string GetOrCreateCorrelationId(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue(HeaderName, out var existing) && !string.IsNullOrWhiteSpace(existing))
        {
            var candidate = existing.ToString().Trim();
            if (IsValid(candidate))
            {
                return candidate;
            }
        }
        // Prefer current Activity TraceId as correlation id to align logs & traces.
        return Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("n");
    }

    // Accept standard 36-char GUID (with hyphens), 32-char hex (no hyphens), or 16-byte hex (32 chars).
    private static bool IsValid(string value)
    {
        if (value.Length > 64) return false; // hard cap to avoid log injection / abuse

        // Check GUID format
        if (Guid.TryParse(value, out _)) return true;

        // Check 32 char hex
        if (value.Length == 32 && value.All(IsHexChar)) return true;

        return false;
    }

    private static bool IsHexChar(char c) => (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
}
