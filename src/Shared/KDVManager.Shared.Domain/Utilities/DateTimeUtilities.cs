namespace KDVManager.Shared.Domain.Utilities;

public static class DateTimeUtilities
{
    public static int CalculateAge(DateOnly dateOfBirth, DateOnly currentDate)
    {
        if (currentDate < dateOfBirth)
            return 0;

        int age = currentDate.Year - dateOfBirth.Year;

        // If the birth date hasn't occurred yet this year, subtract one year
        if (currentDate.Month < dateOfBirth.Month ||
           (currentDate.Month == dateOfBirth.Month && currentDate.Day < dateOfBirth.Day))
        {
            age--;
        }

        return age;
    }
}
