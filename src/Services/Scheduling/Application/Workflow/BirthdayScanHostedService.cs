using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Events;

namespace KDVManager.Services.Scheduling.Application.Workflow;

/// <summary>
/// Daily scan that emits ChildTurnedAgeDomainEvent for children whose birthday is today.
/// </summary>
public sealed class BirthdayScanHostedService : BackgroundService
{
    private readonly IChildRepository _children;
    private readonly IWorkflowEngine _engine;
    private readonly ILogger<BirthdayScanHostedService> _logger;

    public BirthdayScanHostedService(IChildRepository children, IWorkflowEngine engine, ILogger<BirthdayScanHostedService> logger)
    {
        _children = children;
        _engine = engine;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Simple timer loop once per day at 02:00 server local time.
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTimeOffset.Now;
            var targetRun = new DateTimeOffset(now.Year, now.Month, now.Day, 2, 0, 0, now.Offset);
            if (now > targetRun)
                targetRun = targetRun.AddDays(1);
            var delay = targetRun - now;
            await Task.Delay(delay, stoppingToken);

            try
            {
                await ScanAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Birthday scan failed");
            }
        }
    }

    private async Task ScanAsync(CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var all = await _children.ListAllAsync();
        foreach (var child in all)
        {
            if (child.DateOfBirth.Month == today.Month && child.DateOfBirth.Day == today.Day)
            {
                var age = today.Year - child.DateOfBirth.Year;
                var evt = new ChildTurnedAgeDomainEvent(child.Id, child.TenantId, age, today);
                await _engine.PublishAsync(evt, ct);
            }
        }
        _logger.LogInformation("Birthday scan completed for {Count} children", all.Count);
    }
}
