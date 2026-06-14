using System;

namespace KDVManager.Shared.Contracts.Trial;

/// <summary>
/// Represents the trial subscription status of a tenant. The trial lasts
/// <see cref="TrialDurationDays"/> days from the moment the tenant is first seen.
/// </summary>
public class TrialStatus
{
    /// <summary>Length of the trial period in days.</summary>
    public const int TrialDurationDays = 30;

    /// <summary>UTC moment the trial started (first request for the tenant).</summary>
    public DateTime TrialStartDate { get; init; }

    /// <summary>UTC moment the trial ends.</summary>
    public DateTime TrialEndDate { get; init; }

    /// <summary>Whole days remaining in the trial (0 when expired).</summary>
    public int DaysRemaining { get; init; }

    /// <summary>True when the trial period has elapsed.</summary>
    public bool IsExpired { get; init; }

    /// <summary>
    /// Builds a <see cref="TrialStatus"/> from the trial start date, computing the
    /// derived fields relative to <paramref name="nowUtc"/> (defaults to now).
    /// </summary>
    public static TrialStatus FromStartDate(DateTime trialStartDateUtc, DateTime? nowUtc = null)
    {
        var now = nowUtc ?? DateTime.UtcNow;
        var start = DateTime.SpecifyKind(trialStartDateUtc, DateTimeKind.Utc);
        var end = start.AddDays(TrialDurationDays);

        var remaining = (int)Math.Ceiling((end - now).TotalDays);
        if (remaining < 0)
            remaining = 0;

        return new TrialStatus
        {
            TrialStartDate = start,
            TrialEndDate = end,
            DaysRemaining = remaining,
            IsExpired = now >= end,
        };
    }
}
