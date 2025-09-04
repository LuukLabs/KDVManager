using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities;

/// <summary>
/// Per-tenant configuration settings for EndMark automation
/// </summary>
public class EndMarkSettings : IMustHaveTenant
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }

    /// <summary>
    /// Whether EndMark automation is enabled for this tenant
    /// </summary>
    public bool IsEnabled { get; private set; }

    /// <summary>
    /// Number of years after birth date to set the automatic EndMark
    /// </summary>
    public int YearsAfterBirth { get; private set; }

    /// <summary>
    /// Description template for system-generated EndMarks. Can include placeholders like {YearsAfterBirth}
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    private EndMarkSettings() { }

    public EndMarkSettings(bool isEnabled, int yearsAfterBirth, string description)
    {
        IsEnabled = isEnabled;
        YearsAfterBirth = yearsAfterBirth;
        Description = string.IsNullOrWhiteSpace(description) ? GetDefaultDescription(yearsAfterBirth) : description.Trim();
    }

    /// <summary>
    /// Updates the EndMark automation settings
    /// </summary>
    public void UpdateSettings(bool isEnabled, int yearsAfterBirth, string description)
    {
        if (yearsAfterBirth < 0)
            throw new ArgumentException("Years after birth cannot be negative", nameof(yearsAfterBirth));

        IsEnabled = isEnabled;
        YearsAfterBirth = yearsAfterBirth;
        Description = string.IsNullOrWhiteSpace(description) ? GetDefaultDescription(yearsAfterBirth) : description.Trim();
    }

    /// <summary>
    /// Gets the resolved description with placeholders replaced
    /// </summary>
    public string GetResolvedDescription(Child? child = null, DateOnly? birthDate = null)
    {
        var resolved = Description
            .Replace("{YearsAfterBirth}", YearsAfterBirth.ToString());

        if (child != null)
        {
            var childName = !string.IsNullOrWhiteSpace(child.GivenName) && !string.IsNullOrWhiteSpace(child.FamilyName)
                ? $"{child.GivenName} {child.FamilyName}"
                : child.GivenName ?? child.FamilyName ?? "Unknown";

            resolved = resolved.Replace("{childName}", childName);

            // Use child's birth date if not explicitly provided
            if (!birthDate.HasValue)
            {
                birthDate = child.DateOfBirth;
            }
        }

        if (birthDate.HasValue)
        {
            resolved = resolved.Replace("{birthDate}", birthDate.Value.ToString("yyyy-MM-dd"));
        }

        return resolved;
    }

    /// <summary>
    /// Creates default settings for a new tenant
    /// </summary>
    public static EndMarkSettings CreateDefault()
    {
        return new EndMarkSettings(
            isEnabled: true,
            yearsAfterBirth: 4,
            description: GetDefaultDescription(4));
    }

    private static string GetDefaultDescription(int years)
    {
        return $"Automatic end mark for {{childName}} ({{YearsAfterBirth}} years after birth on {{birthDate}})";
    }
}
