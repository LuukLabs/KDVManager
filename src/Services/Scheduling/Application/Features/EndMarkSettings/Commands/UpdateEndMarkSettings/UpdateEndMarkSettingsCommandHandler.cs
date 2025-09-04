using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.EndMarkSettings.Commands.UpdateEndMarkSettings;

public class UpdateEndMarkSettingsCommandHandler
{
    private readonly IEndMarkSettingsRepository _repository;

    public UpdateEndMarkSettingsCommandHandler(IEndMarkSettingsRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(UpdateEndMarkSettingsCommand request)
    {
        // Validate the request
        var validator = new UpdateEndMarkSettingsCommandValidator();
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        // Get or create settings for current tenant
        var settings = await _repository.GetOrCreateDefaultAsync();

        // Update the settings
        settings.UpdateSettings(
            request.IsEnabled,
            request.YearsAfterBirth,
            request.Description);

        // Save changes
        await _repository.UpdateAsync(settings);
    }
}
