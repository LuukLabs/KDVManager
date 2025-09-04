using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities;

/// <summary>
/// Manual cutoff marker for a child's schedule timeline. When present between a schedule's start and the next schedule's start,
/// it truncates the schedule's EndDate to EndMark.EndDate.AddDays(-1).
/// </summary>
public class EndMark : IMustHaveTenant
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid ChildId { get; private set; }
    public DateOnly EndDate { get; private set; }
    public string? Reason { get; private set; }
    public bool IsSystemGenerated { get; private set; }

    private EndMark() { }

    public EndMark(Guid childId, DateOnly endDate, string? reason = null, bool isSystemGenerated = false)
    {
        ChildId = childId;
        EndDate = endDate;
        Reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
        IsSystemGenerated = isSystemGenerated;
    }

    /// <summary>
    /// Updates the end date for system-generated EndMarks. Only allowed for system-generated EndMarks.
    /// </summary>
    public void UpdateEndDate(DateOnly newEndDate)
    {
        if (!IsSystemGenerated)
            throw new InvalidOperationException("Cannot update end date for manually created EndMarks.");

        EndDate = newEndDate;
    }
}
