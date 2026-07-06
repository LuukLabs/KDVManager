using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using KDVManager.Shared.Contracts.Tenancy;

namespace KDVManager.Shared.Infrastructure.Tenancy
{
    public static class TenancyExtensions
    {
        public static IServiceCollection AddTenancy(this IServiceCollection services)
        {
            // Singleton because the accessor is AsyncLocal-backed: one instance safely serves
            // all requests/consumers and can be injected into singleton OTel processors.
            services.AddSingleton<ITenancyContextAccessor, TenancyContextAccessor>();
            services.AddScoped<ITenancyResolver, JwtTenancyResolver>();
            return services;
        }

        public static IApplicationBuilder UseTenancy(this IApplicationBuilder app)
        {
            return app.UseMiddleware<TenancyMiddleware>();
        }
    }
}
