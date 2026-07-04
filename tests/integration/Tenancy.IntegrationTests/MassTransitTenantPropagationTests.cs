using System.Collections.Concurrent;
using KDVManager.IntegrationTests.Tenancy.Support;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Tenancy;
using MassTransit;
using MassTransit.Testing;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace KDVManager.IntegrationTests.Tenancy;

public record TenantScopedTestMessage(Guid Marker);

public class CapturedTenants
{
    private readonly ConcurrentDictionary<Guid, Guid?> _byMarker = new();

    public void Record(Guid marker, Guid? tenantId) => _byMarker[marker] = tenantId;

    public bool TryGet(Guid marker, out Guid? tenantId) => _byMarker.TryGetValue(marker, out tenantId);
}

public class TenantCapturingConsumer : IConsumer<TenantScopedTestMessage>
{
    private readonly ITenancyContextAccessor _accessor;
    private readonly CapturedTenants _captured;

    public TenantCapturingConsumer(ITenancyContextAccessor accessor, CapturedTenants captured)
    {
        _accessor = accessor;
        _captured = captured;
    }

    public Task Consume(ConsumeContext<TenantScopedTestMessage> context)
    {
        _captured.Record(context.Message.Marker, _accessor.HasTenant ? _accessor.Current!.TenantId : null);
        return Task.CompletedTask;
    }
}

public class MassTransitTenantPropagationTests
{
    private static ServiceProvider BuildProvider(CapturedTenants captured)
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddHttpContextAccessor();
        services.AddSingleton(captured);
        services.AddTenancy();

        services.AddMassTransitTestHarness(x =>
        {
            x.AddConsumer<TenantCapturingConsumer>();

            x.UsingInMemory((context, cfg) =>
            {
                cfg.ConfigureEndpoints(context);

                cfg.UseConsumeFilter(typeof(MassTransitTenancyConsumeFilter<>), context);
                cfg.UseSendFilter(typeof(MassTransitTenancySendFilter<>), context);
                cfg.UsePublishFilter(typeof(MassTransitTenancyPublishFilter<>), context);
            });
        });

        return services.BuildServiceProvider(validateScopes: true);
    }

    [Fact]
    public async Task TenantFlowsFromPublisherScopeToConsumer()
    {
        var captured = new CapturedTenants();
        await using var provider = BuildProvider(captured);
        var harness = provider.GetRequiredService<ITestHarness>();
        await harness.Start();

        try
        {
            var marker = Guid.NewGuid();
            using (var scope = provider.CreateScope())
            {
                scope.ServiceProvider.GetRequiredService<ITenancyContextAccessor>().Current = new StaticTenancyContext(Tenants.A);
                await scope.ServiceProvider.GetRequiredService<IPublishEndpoint>().Publish(new TenantScopedTestMessage(marker));
            }

            Assert.True(await harness.Consumed.Any<TenantScopedTestMessage>(x => x.Context.Message.Marker == marker));
            Assert.True(captured.TryGet(marker, out var tenantId));
            Assert.Equal(Tenants.A, tenantId);
        }
        finally
        {
            await harness.Stop();
        }
    }

    [Fact]
    public async Task MessageWithoutTenantHeaderIsConsumedWithoutTenantContext()
    {
        var captured = new CapturedTenants();
        await using var provider = BuildProvider(captured);
        var harness = provider.GetRequiredService<ITestHarness>();
        await harness.Start();

        try
        {
            var marker = Guid.NewGuid();
            await harness.Bus.Publish(new TenantScopedTestMessage(marker));

            Assert.True(await harness.Consumed.Any<TenantScopedTestMessage>(x => x.Context.Message.Marker == marker));
            Assert.True(captured.TryGet(marker, out var tenantId));
            Assert.Null(tenantId);
        }
        finally
        {
            await harness.Stop();
        }
    }

    [Fact]
    public async Task MessageWithMalformedTenantHeaderIsNotConsumed()
    {
        var captured = new CapturedTenants();
        await using var provider = BuildProvider(captured);
        var harness = provider.GetRequiredService<ITestHarness>();
        await harness.Start();

        try
        {
            var marker = Guid.NewGuid();
            await harness.Bus.Publish(
                new TenantScopedTestMessage(marker),
                context => context.Headers.Set(TenancyHeaders.TenantId, "not-a-guid"));

            await harness.InactivityTask;

            // The consume filter must fail closed: the consumer never runs and every
            // delivery attempt surfaces the malformed header as an exception.
            Assert.False(captured.TryGet(marker, out _));
            var attempts = harness.Consumed.Select<TenantScopedTestMessage>().ToList();
            Assert.All(attempts, attempt => Assert.NotNull(attempt.Exception));
        }
        finally
        {
            await harness.Stop();
        }
    }
}
