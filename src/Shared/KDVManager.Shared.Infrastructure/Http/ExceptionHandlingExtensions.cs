using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace KDVManager.Shared.Infrastructure.Http;

public static class ExceptionHandlingExtensions
{
    public static IServiceCollection AddKdvManagerExceptionHandling(
        this IServiceCollection services,
        string serviceName)
    {
        services.AddSingleton(_ => new ApiErrorMetrics(serviceName));
        return services;
    }

    public static IApplicationBuilder UseKdvManagerExceptionHandler(this IApplicationBuilder app) =>
        app.UseMiddleware<ExceptionHandlerMiddleware>();
}
