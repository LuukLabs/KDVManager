using FluentValidation;

namespace KDVManager.Services.Scheduling.Application.Features.EndMarkSettings.Commands.UpdateEndMarkSettings;

public class UpdateEndMarkSettingsCommandValidator : AbstractValidator<UpdateEndMarkSettingsCommand>
{
    public UpdateEndMarkSettingsCommandValidator()
    {
        RuleFor(x => x.YearsAfterBirth)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Years after birth must be 0 or greater")
            .LessThanOrEqualTo(50)
            .WithMessage("Years after birth must be 50 or less");

        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Description is required")
            .MaximumLength(500)
            .WithMessage("Description must be 500 characters or less");
    }
}
