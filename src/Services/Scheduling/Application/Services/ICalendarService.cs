using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Services;

/// <summary>
/// Provides aggregated calendar style events for one or more groups over a date range.
/// The result flattens schedule rules (expanded to concrete days), absences, closure periods and (future) actual entries.
/// Intended to serve multiple features (overview screens, printing, availability) and potential iCal export.
/// </summary>
public interface ICalendarService
{
    Task<IReadOnlyList<CalendarEvent>> GetForGroupsAsync(IEnumerable<Guid>? groupIds, DateOnly from, DateOnly to, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CalendarEvent>> GetForChildAsync(Guid childId, DateOnly from, DateOnly to, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CalendarEvent>> GetAllAsync(DateOnly from, DateOnly to, CancellationToken cancellationToken = default);
}
