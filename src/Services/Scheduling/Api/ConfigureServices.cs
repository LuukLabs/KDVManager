namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    /// <summary>Service-specific API registrations; shared defaults come from AddKdvManagerApi.</summary>
    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        services.AddControllers();

        // Query handlers (could consider MediatR later)
        services.AddScoped<KDVManager.Services.Scheduling.Application.Features.PrintSchedules.Queries.GetPrintSchedules.GetPrintSchedulesQueryHandler>();

        return services;
    }
}
