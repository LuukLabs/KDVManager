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
/// Service responsible for computing and publishing child schedule active status changes.
/// A child is considered active when they have at least one schedule where
/// today's date falls between the StartDate and EndDate (or EndDate is null).
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
        _logger.LogInformation("Starting schedule status sync for all children across all tenants");

        // Get all distinct tenant IDs from children (bypassing tenant filter)
        var tenantIds = await _dbContext.Children
            .IgnoreQueryFilters()
            .Select(c => c.TenantId)
            .Distinct()
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Found {TenantCount} tenants to process", tenantIds.Count);

        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var totalProcessedCount = 0;

        foreach (var tenantId in tenantIds)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning("Schedule status sync cancelled after processing {Count} children", totalProcessedCount);
                break;
            }

            try
            {
                // Set tenant context for this iteration
                _tenancyContextAccessor.Current = new StaticTenancyContext(tenantId);

                var processedCount = await SyncChildrenForCurrentTenantAsync(now, cancellationToken);
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

        _logger.LogInformation("Schedule status sync completed. Processed {Count} children across {TenantCount} tenants",
            totalProcessedCount, tenantIds.Count);
        return totalProcessedCount;
    }

    private async Task<int> SyncChildrenForCurrentTenantAsync(DateOnly today, CancellationToken cancellationToken)
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
                await PublishStatusForChildInternalAsync(child.Id, today, cancellationToken);
                processedCount++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing schedule status for child {ChildId}", child.Id);
            }
        }

        return processedCount;
    }

    public async Task PublishStatusForChildAsync(Guid childId, CancellationToken cancellationToken = default)
    {
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        await PublishStatusForChildInternalAsync(childId, now, cancellationToken);
    }

    private async Task PublishStatusForChildInternalAsync(Guid childId, DateOnly today, CancellationToken cancellationToken)
    {
        var schedules = await _dbContext.Schedules
            .Where(s => s.ChildId == childId)
            .ToListAsync(cancellationToken);

        // A child is active if they have at least one schedule where today falls between StartDate and EndDate
        var hasActiveSchedule = schedules.Any(s =>
            s.StartDate <= today &&
            (!s.EndDate.HasValue || s.EndDate >= today));

        // Get the latest end date from all schedules (for showing "last active until" in UI)
        DateOnly? lastActiveDate = null;
        var schedulesWithEndDate = schedules.Where(s => s.EndDate.HasValue).ToList();
        if (schedulesWithEndDate.Any())
        {
            lastActiveDate = schedulesWithEndDate.Max(s => s.EndDate!.Value);
        }

        var evt = new ChildScheduleStatusChangedEvent
        {
            ChildId = childId,
            IsActive = hasActiveSchedule,
            LastActiveDate = lastActiveDate
        };

        await _publishEndpoint.Publish(evt, cancellationToken);

        _logger.LogDebug(
            "Published schedule status for child {ChildId}: IsActive={IsActive}, LastActiveDate={LastActiveDate}",
            childId, hasActiveSchedule, lastActiveDate);
    }
}
