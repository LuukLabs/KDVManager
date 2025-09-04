using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Contracts.Services;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace KDVManager.Services.Scheduling.Application.Services;

/// <summary>
/// Service responsible for maintaining system-generated EndMarks for children
/// </summary>
public class EndMarkAutomationService : IEndMarkAutomationService
{
    private readonly IEndMarkRepository _endMarkRepository;
    private readonly IEndMarkSettingsRepository _endMarkSettingsRepository;
    private readonly IChildRepository _childRepository;
    private readonly IScheduleTimelineService _scheduleTimelineService;
    private readonly ILogger<EndMarkAutomationService> _logger;

    public EndMarkAutomationService(
        IEndMarkRepository endMarkRepository,
        IEndMarkSettingsRepository endMarkSettingsRepository,
        IChildRepository childRepository,
        IScheduleTimelineService scheduleTimelineService,
        ILogger<EndMarkAutomationService> logger)
    {
        _endMarkRepository = endMarkRepository;
        _endMarkSettingsRepository = endMarkSettingsRepository;
        _childRepository = childRepository;
        _scheduleTimelineService = scheduleTimelineService;
        _logger = logger;
    }

    public async Task MaintainEndMarkAsync(Child child, CancellationToken cancellationToken = default)
    {
        // Get tenant-specific settings from database
        var settings = await _endMarkSettingsRepository.GetOrCreateDefaultAsync();

        if (!settings.IsEnabled)
        {
            _logger.LogDebug("EndMark automation is disabled for tenant, skipping maintenance for child {ChildId}", child.Id);
            return;
        }

        _logger.LogInformation("Maintaining EndMark for child {ChildId} (DoB: {DateOfBirth})", child.Id, child.DateOfBirth);

        // Calculate the expected EndMark date
        var expectedEndDate = child.DateOfBirth.AddYears(settings.YearsAfterBirth);

        // Get existing system-generated EndMarks for this child
        var existingSystemEndMarks = await _endMarkRepository.GetSystemGeneratedByChildIdAsync(child.Id);

        // Also check if there are ANY EndMarks (system or manual) for this child
        // If user has manually created EndMarks, we don't want to interfere
        var allEndMarks = await _endMarkRepository.GetByChildIdAsync(child.Id);

        if (existingSystemEndMarks.Count == 0)
        {
            // Only create a system EndMark if there are no existing EndMarks at all
            // This respects user's decision to delete system EndMarks or create manual ones
            if (allEndMarks?.Count == 0)
            {
                await CreateSystemEndMarkAsync(child.Id, expectedEndDate, settings, cancellationToken);
            }
            else
            {
                _logger.LogDebug("EndMarks already exist for child {ChildId}, not creating system EndMark", child.Id);
                return;
            }
        }
        else if (existingSystemEndMarks.Count == 1)
        {
            // One system-generated EndMark exists, update if necessary
            var existingEndMark = existingSystemEndMarks.First();
            await UpdateSystemEndMarkAsync(existingEndMark, expectedEndDate, settings, child, cancellationToken);
        }
        else
        {
            // Multiple system-generated EndMarks exist (shouldn't happen, but handle gracefully)
            _logger.LogWarning("Found {Count} system-generated EndMarks for child {ChildId}, cleaning up duplicates",
                existingSystemEndMarks.Count, child.Id);

            await CleanupDuplicateSystemEndMarksAsync(existingSystemEndMarks, expectedEndDate, cancellationToken);
        }

        // Recalculate schedule timelines after EndMark changes
        await _scheduleTimelineService.RecalculateAsync(child.Id);

        _logger.LogInformation("EndMark maintenance completed for child {ChildId}", child.Id);
    }

    private async Task CreateSystemEndMarkAsync(Guid childId, DateOnly endDate, EndMarkSettings settings, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating system EndMark for child {ChildId} with end date {EndDate}", childId, endDate);

        // Get child information for description resolution
        var child = await _childRepository.GetByIdAsync(childId);
        var resolvedDescription = child != null
            ? settings.GetResolvedDescription(child)
            : settings.GetResolvedDescription();

        var endMark = new EndMark(
            childId: childId,
            endDate: endDate,
            reason: resolvedDescription,
            isSystemGenerated: true);

        await _endMarkRepository.AddAsync(endMark);
    }

    private async Task UpdateSystemEndMarkAsync(EndMark existingEndMark, DateOnly targetEndDate, EndMarkSettings settings, Child child, CancellationToken cancellationToken)
    {
        var resolvedDescription = settings.GetResolvedDescription(child);

        bool hasChanges = false;

        if (existingEndMark.EndDate != targetEndDate)
        {
            existingEndMark.UpdateEndDate(targetEndDate);
            hasChanges = true;
            _logger.LogInformation("Updated EndMark date for child {ChildId} from {OldDate} to {NewDate}",
                child.Id, existingEndMark.EndDate, targetEndDate);
        }

        // Check if the reason/description has changed
        if (existingEndMark.Reason != resolvedDescription)
        {
            // Since EndMark doesn't have an UpdateReason method, we need to replace the EndMark
            // Remove the old one and create a new one
            await _endMarkRepository.DeleteAsync(existingEndMark);

            var newEndMark = new EndMark(
                childId: child.Id,
                endDate: targetEndDate,
                reason: resolvedDescription,
                isSystemGenerated: true);

            await _endMarkRepository.AddAsync(newEndMark);
            hasChanges = true;
            _logger.LogInformation("Updated EndMark description for child {ChildId}", child.Id);
        }
        else if (hasChanges)
        {
            await _endMarkRepository.UpdateAsync(existingEndMark);
        }

        if (hasChanges)
        {
            await _scheduleTimelineService.RecalculateAsync(child.Id);
        }
        else
        {
            _logger.LogDebug("System EndMark for child {ChildId} is already up to date", child.Id);
        }
    }

    private async Task CleanupDuplicateSystemEndMarksAsync(
        IReadOnlyList<EndMark> duplicateEndMarks,
        DateOnly correctEndDate,
        CancellationToken cancellationToken)
    {
        // Keep the first one and update it, delete the rest
        var endMarkToKeep = duplicateEndMarks.First();
        var endMarksToDelete = duplicateEndMarks.Skip(1);

        // Update the one we're keeping
        if (endMarkToKeep.EndDate != correctEndDate)
        {
            endMarkToKeep.UpdateEndDate(correctEndDate);
            await _endMarkRepository.UpdateAsync(endMarkToKeep);
        }

        // Delete the duplicates
        foreach (var endMark in endMarksToDelete)
        {
            _logger.LogInformation("Deleting duplicate system EndMark {EndMarkId}", endMark.Id);
            await _endMarkRepository.DeleteAsync(endMark);
        }
    }
}
