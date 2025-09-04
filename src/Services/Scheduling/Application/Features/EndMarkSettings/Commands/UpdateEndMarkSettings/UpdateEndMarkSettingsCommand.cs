namespace KDVManager.Services.Scheduling.Application.Features.EndMarkSettings.Commands.UpdateEndMarkSettings;

public class UpdateEndMarkSettingsCommand
{
    public bool IsEnabled { get; set; }
    public int YearsAfterBirth { get; set; }
    public string Description { get; set; } = string.Empty;
}
