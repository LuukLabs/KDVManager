using FluentValidation;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild;

public class UpdateChildCommandValidator : AbstractValidator<UpdateChildCommand>
{
    public UpdateChildCommandValidator()
    {
        RuleFor(p => p.GivenName)
            .NotEmpty()
            .NotNull()
            .MaximumLength(25);

        RuleFor(p => p.FamilyName)
            .NotEmpty()
            .NotNull()
            .MaximumLength(25);

        RuleFor(p => p.DateOfBirth)
            .NotEmpty()
            .NotNull();

        RuleFor(p => p.Allergies)
            .MaximumLength(1000);

        RuleFor(p => p.Medication)
            .MaximumLength(1000);

        RuleFor(p => p.DietaryRequirements)
            .MaximumLength(1000);

        RuleFor(p => p.MedicalNotes)
            .MaximumLength(2000);
    }
}
