using KDVManager.Shared.Contracts.Tenancy;
using Microsoft.AspNetCore.Http;

namespace KDVManager.Shared.Infrastructure.Tenancy;

public class HeaderTenancyResolver : ITenancyResolver
{
    private readonly IHttpContextAccessor _http;
    private readonly ITenancyContextAccessor _accessor;

    public HeaderTenancyResolver(IHttpContextAccessor http, ITenancyContextAccessor accessor)
    {
        _http = http;
        _accessor = accessor;
    }

    public ITenancyContext? Resolve()
    {
        var headers = _http.HttpContext?.Request?.Headers;
        if (headers == null)
        {
            Console.WriteLine("[HeaderTenancyResolver] No headers available");
            return null;
        }

        // Debug: Print all headers for debugging
        Console.WriteLine("[HeaderTenancyResolver] Available headers:");
        foreach (var header in headers)
        {
            Console.WriteLine($"  {header.Key}: {string.Join(", ", header.Value.ToArray())}");
        }

        // Extract tenant ID from header set by Envoy
        if (headers.TryGetValue("x-jwt-tenant", out var tenantHeader))
        {
            var tenantValue = tenantHeader.FirstOrDefault();
            Console.WriteLine($"[HeaderTenancyResolver] Found x-jwt-tenant header: {tenantValue}");

            if (tenantValue != null && Guid.TryParse(tenantValue, out var tenantId))
            {
                Console.WriteLine($"[HeaderTenancyResolver] Successfully parsed tenant ID: {tenantId}");
                return new StaticTenancyContext(tenantId);
            }
            else
            {
                Console.WriteLine($"[HeaderTenancyResolver] Failed to parse tenant ID from value: {tenantValue}");
            }
        }
        else
        {
            Console.WriteLine("[HeaderTenancyResolver] No x-jwt-tenant header found");
        }

        return null;
    }
}
