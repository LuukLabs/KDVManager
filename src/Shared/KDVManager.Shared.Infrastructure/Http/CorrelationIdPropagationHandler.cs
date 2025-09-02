using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;

namespace KDVManager.Shared.Infrastructure.Http;

/// <summary>
/// Delegating handler that ensures the current X-Request-ID is propagated on outbound HTTP requests.
/// Falls back to Activity TraceId if header missing.
/// </summary>
public class CorrelationIdPropagationHandler : DelegatingHandler
{
    private const string HeaderName = "X-Request-ID";
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CorrelationIdPropagationHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var context = _httpContextAccessor.HttpContext;
        string? correlationId = null;
        if (context != null && context.Request.Headers.TryGetValue(HeaderName, out var existing) && !string.IsNullOrWhiteSpace(existing))
        {
            correlationId = existing.ToString();
        }
        else if (System.Diagnostics.Activity.Current is { } activity)
        {
            correlationId = activity.TraceId.ToString();
        }

        if (!string.IsNullOrWhiteSpace(correlationId) && !request.Headers.Contains(HeaderName))
        {
            request.Headers.TryAddWithoutValidation(HeaderName, correlationId);
        }

        return base.SendAsync(request, cancellationToken);
    }
}
