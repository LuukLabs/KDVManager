namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // No application-layer handlers yet; the trial status is served directly
        // from infrastructure. Kept for parity with the other services so the API
        // composition root stays uniform.
        return services;
    }
}
