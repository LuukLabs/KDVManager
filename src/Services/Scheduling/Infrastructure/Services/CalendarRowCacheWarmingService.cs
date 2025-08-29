using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Services;

namespace KDVManager.Services.Scheduling.Infrastructure.Services;

public class CalendarRowCacheWarmingService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CalendarRowCacheWarmingService> _logger;

    public CalendarRowCacheWarmingService(IServiceProvider serviceProvider, ILogger<CalendarRowCacheWarmingService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Run at startup
        await WarmAsync(stoppingToken);

        // Then daily at 02:00 server time
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.Now;
            var nextRun = now.Date.AddDays(1).AddHours(2);
            var delay = nextRun - now;
            if (delay < TimeSpan.Zero) delay = TimeSpan.FromHours(24);
            await Task.Delay(delay, stoppingToken);
            await WarmAsync(stoppingToken);
        }
    }

    private async Task WarmAsync(CancellationToken ct)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var groupRepo = scope.ServiceProvider.GetRequiredService<IGroupRepository>();
            var queryService = scope.ServiceProvider.GetRequiredService<ICalendarRowQueryService>();
            var groups = await groupRepo.ListAllAsync();
            var start = DateOnly.FromDateTime(DateTime.UtcNow.Date);
            var end = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30));
            foreach (var g in groups)
            {
                if (ct.IsCancellationRequested) break;
                await queryService.GetRowsAsync(g.Id, start, end);
            }
            _logger.LogInformation("Calendar row cache warming completed for {Count} groups", groups.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during calendar row cache warming");
        }
    }
}
