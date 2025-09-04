using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.EndMarkSettings.Queries.GetEndMarkSettings;

public class GetEndMarkSettingsQueryHandler
{
    private readonly IEndMarkSettingsRepository _repository;

    public GetEndMarkSettingsQueryHandler(IEndMarkSettingsRepository repository)
    {
        _repository = repository;
    }

    public async Task<EndMarkSettingsDto> Handle(GetEndMarkSettingsQuery request)
    {
        var settings = await _repository.GetOrCreateDefaultAsync();

        return new EndMarkSettingsDto
        {
            IsEnabled = settings.IsEnabled,
            YearsAfterBirth = settings.YearsAfterBirth,
            Description = settings.Description
        };
    }
}
