using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities;

public class Group : IMustHaveTenant
{
    public Guid Id { get; set; }

    public Guid TenantId { get; set; }

    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional target number of staff members typically planned for this group.
    /// Used as a hint for compliance alerts when staffing data is missing.
    /// </summary>
    public int? TargetStaffCount { get; set; }

    /// <summary>
    /// Warning buffer (percentage) applied when actual staff exceeds minimum requirement by less than this margin.
    /// Defaults to 5% in migrations.
    /// </summary>
    public double WarningBufferPercent { get; set; } = 5;

}
