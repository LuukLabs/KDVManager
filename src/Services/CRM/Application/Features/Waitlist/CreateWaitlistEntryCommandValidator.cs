using FluentValidation;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class CreateWaitlistEntryCommandValidator : AbstractValidator<CreateWaitlistEntryCommand>
{
    public CreateWaitlistEntryCommandValidator()
    {
        RuleFor(entry => entry.GivenName).NotEmpty().MaximumLength(50);
        RuleFor(entry => entry.FamilyName).NotEmpty().MaximumLength(100);
        RuleFor(entry => entry.DateOfBirth).NotNull();
        RuleFor(entry => entry.DesiredStartDate).NotNull();
        RuleFor(entry => entry.ContactName).NotEmpty().MaximumLength(150);
        RuleFor(entry => entry.ContactEmail).NotEmpty().EmailAddress().MaximumLength(254);
        RuleFor(entry => entry.ContactPhone).MaximumLength(30);
        RuleFor(entry => entry.RequestedDays).MaximumLength(100);
        RuleFor(entry => entry.Notes).MaximumLength(1000);
    }
}
