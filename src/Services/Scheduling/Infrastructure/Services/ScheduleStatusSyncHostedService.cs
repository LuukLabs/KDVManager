using System;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Infrastructure.Services;

/// <summary>
/// Background service that periodically syncs child schedule active status.
/// Runs every 6 hours to ensure time-based status changes are captured
/// (e.g., when a schedule's EndDate is reached).
/// </summary>
public class ScheduleStatusSyncHostedService : BackgroundService
{
  private readonly IServiceProvider _serviceProvider;
  private readonly ILogger<ScheduleStatusSyncHostedService> _logger;
  private readonly TimeSpan _interval = TimeSpan.FromHours(6);

  public ScheduleStatusSyncHostedService(
      IServiceProvider serviceProvider,
      ILogger<ScheduleStatusSyncHostedService> logger)
  {
    _serviceProvider = serviceProvider;
    _logger = logger;
  }

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    _logger.LogInformation(
        "Schedule Status Sync Service started. Will run every {Hours} hours",
        _interval.TotalHours);

    // Run immediately on startup, then periodically
    await RunSyncAsync(stoppingToken);

    while (!stoppingToken.IsCancellationRequested)
    {
      try
      {
        await Task.Delay(_interval, stoppingToken);
        await RunSyncAsync(stoppingToken);
      }
      catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
      {
        _logger.LogInformation("Schedule Status Sync Service is stopping");
        break;
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error in Schedule Status Sync Service");
        // Wait a bit before retrying on error
        await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
      }
    }
  }

  private async Task RunSyncAsync(CancellationToken cancellationToken)
  {
    _logger.LogInformation("Starting scheduled sync of child active status");

    try
    {
      using var scope = _serviceProvider.CreateScope();
      var scheduleStatusService = scope.ServiceProvider.GetRequiredService<IScheduleStatusService>();

      var count = await scheduleStatusService.SyncAllChildrenStatusAsync(cancellationToken);

      _logger.LogInformation(
          "Completed scheduled sync of child active status. Processed {Count} children",
          count);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Failed to sync child active status");
      throw;
    }
  }
}
