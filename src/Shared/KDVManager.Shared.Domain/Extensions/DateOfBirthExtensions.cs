using KDVManager.Shared.Domain.Interfaces;
using KDVManager.Shared.Domain.Utilities;

namespace KDVManager.Shared.Domain.Extensions;

public static class DateOfBirthExtensions
{
    /// <summary>
    /// Returns the age in whole years for an entity that has a DateOfBirth.
    /// </summary>
    /// <param name="source">Entity implementing IHasDateOfBirth.</param>
    /// <param name="asOf">Optional as-of date; defaults to today's UTC date.</param>
    public static int Age(this IHasDateOfBirth source, DateOnly? asOf = null)
    {
        if (source is null) return 0;
        if (source.DateOfBirth == default) return 0;
        var current = asOf ?? DateOnly.FromDateTime(DateTime.UtcNow);
        return DateTimeUtilities.CalculateAge(source.DateOfBirth, current);
    }
}
