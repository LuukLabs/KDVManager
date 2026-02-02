using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using KDVManager.Shared.Contracts.Events;
using KDVManager.Shared.Contracts.Tenancy;
using KDVManager.Shared.Infrastructure.Tenancy;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Infrastructure.Services;

/// <summary>
/// Service responsible for computing and publishing child activity intervals.
/// Activity intervals represent periods when a child has scheduled attendance,
/// derived from their schedules (including EndDates calculated from endmarks).
/// </summary>
public class ScheduleStatusService : IScheduleStatusService
{
  private readonly ApplicationDbContext _dbContext;
  private readonly ITenancyContextAccessor _tenancyContextAccessor;
  private readonly IPublishEndpoint _publishEndpoint;
  private readonly ILogger<ScheduleStatusService> _logger;

  public ScheduleStatusService(
      ApplicationDbContext dbContext,
      ITenancyContextAccessor tenancyContextAccessor,
      IPublishEndpoint publishEndpoint,
      ILogger<ScheduleStatusService> logger)
  {
    _dbContext = dbContext;
    _tenancyContextAccessor = tenancyContextAccessor;
    _publishEndpoint = publishEndpoint;
    _logger = logger;
  }

  public async Task<int> SyncAllChildrenStatusAsync(CancellationToken cancellationToken = default)
  {
    _logger.LogInformation("Starting activity interval sync for all children across all tenants");

    // Get all distinct tenant IDs from children (bypassing tenant filter)
    var tenantIds = await _dbContext.Children
        .IgnoreQueryFilters()
        .Select(c => c.TenantId)
        .Distinct()
        .ToListAsync(cancellationToken);

    _logger.LogInformation("Found {TenantCount} tenants to process", tenantIds.Count);

    var totalProcessedCount = 0;

    foreach (var tenantId in tenantIds)
    {
      if (cancellationToken.IsCancellationRequested)
      {
        _logger.LogWarning("Activity interval sync cancelled after processing {Count} children", totalProcessedCount);
        break;
      }

      try
      {
        // Set tenant context for this iteration
        _tenancyContextAccessor.Current = new StaticTenancyContext(tenantId);

        var processedCount = await SyncChildrenForCurrentTenantAsync(cancellationToken);
        totalProcessedCount += processedCount;

        _logger.LogInformation(
            "Processed {Count} children for tenant {TenantId}",
            processedCount, tenantId);
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error processing tenant {TenantId}", tenantId);
      }
    }

    _logger.LogInformation("Activity interval sync completed. Processed {Count} children across {TenantCount} tenants",
        totalProcessedCount, tenantIds.Count);
    return totalProcessedCount;
  }

  private async Task<int> SyncChildrenForCurrentTenantAsync(CancellationToken cancellationToken)
  {
    // Now the tenant filter is active, so this returns only children for current tenant
    var children = await _dbContext.Children.ToListAsync(cancellationToken);
    var processedCount = 0;

    foreach (var child in children)
    {
      if (cancellationToken.IsCancellationRequested)
        break;

      try
      {
        await PublishStatusForChildInternalAsync(child.Id, cancellationToken);
        processedCount++;
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error processing activity intervals for child {ChildId}", child.Id);
      }
    }

    return processedCount;
  }

  public async Task PublishStatusForChildAsync(Guid childId, CancellationToken cancellationToken = default)
  {
    await PublishStatusForChildInternalAsync(childId, cancellationToken);
  }

  private async Task PublishStatusForChildInternalAsync(Guid childId, CancellationToken cancellationToken)
  {
    // Get all schedules for this child, ordered by start date
    var schedules = await _dbContext.Schedules
        .Where(s => s.ChildId == childId)
        .OrderBy(s => s.StartDate)
        .ToListAsync(cancellationToken);

    // Convert schedules to activity intervals
    // Each schedule represents an interval from StartDate to EndDate
    // EndDate comes from the schedule's calculated end (based on next schedule or endmark)
    var intervals = schedules
        .Select(s => new ActivityInterval
        {
          StartDate = s.StartDate,
          EndDate = s.EndDate
        })
        .ToList();

    var evt = new ChildActivityIntervalsChangedEvent
    {
      ChildId = childId,
      Intervals = intervals
    };

    await _publishEndpoint.Publish(evt, cancellationToken);

    _logger.LogDebug(
        "Published activity intervals for child {ChildId}: {IntervalCount} intervals",
        childId, intervals.Count);
  }
}
