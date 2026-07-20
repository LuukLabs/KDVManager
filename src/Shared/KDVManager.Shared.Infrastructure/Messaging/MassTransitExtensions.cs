using KDVManager.Shared.Infrastructure.Tenancy;
using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace KDVManager.Shared.Infrastructure.Messaging;

public static class MassTransitExtensions
{
    /// <summary>
    /// Registers MassTransit on RabbitMQ with the KDVManager tenancy filters applied to
    /// the consume, send and publish pipelines. Service-specific consumers are added via
    /// <paramref name="configure"/>.
    /// </summary>
    public static IServiceCollection AddKdvManagerMassTransit(this IServiceCollection services, IConfiguration configuration, Action<IBusRegistrationConfigurator>? configure = null)
    {
        services.AddMassTransit(x =>
        {
            configure?.Invoke(x);

            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(configuration.GetConnectionString("RabbitMQ"));
                cfg.ConfigureEndpoints(context);

                cfg.UseConsumeFilter(typeof(MassTransitTenancyConsumeFilter<>), context);
                cfg.UseSendFilter(typeof(MassTransitTenancySendFilter<>), context);
                cfg.UsePublishFilter(typeof(MassTransitTenancyPublishFilter<>), context);
            });
        });

        return services;
    }
}
