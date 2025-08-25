using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Shared.Infrastructure.Tenancy
{
    public static class TenancyExtensions
    {
        public static IServiceCollection AddTenancy(this IServiceCollection services)
        {
            services.AddScoped<ITenancyContextAccessor, TenancyContextAccessor>();
            services.AddScoped<ITenancyResolver, HeaderTenancyResolver>();
            return services;
        }

        public static IApplicationBuilder UseTenancy(this IApplicationBuilder app, string tenantClaimType = "tenant")
        {
            return app.UseMiddleware<TenancyMiddleware>(tenantClaimType);
        }
    }
}
