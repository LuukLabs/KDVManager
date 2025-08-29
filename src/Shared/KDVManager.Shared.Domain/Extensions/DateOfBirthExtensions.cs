using System;
using KDVManager.Shared.Domain.Interfaces;
using KDVManager.Shared.Domain.Utilities;

namespace KDVManager.Shared.Domain.Extensions;

public static class DateOfBirthExtensions
{
    public static int Age(this IHasDateOfBirth source, DateOnly? asOf = null)
    {
        var current = asOf ?? DateOnly.FromDateTime(DateTime.Today);
        return DateTimeUtilities.CalculateAge(source.DateOfBirth, current);
    }
}
