namespace KDVManager.Services.Scheduling.Application.Features.EndMarkSettings.Queries.GetEndMarkSettings;

public class GetEndMarkSettingsQuery
{
    // No parameters needed as we get settings for the current tenant
}

public class EndMarkSettingsDto
{
    public bool IsEnabled { get; set; }
    public int YearsAfterBirth { get; set; }
    public string Description { get; set; } = string.Empty;
}
