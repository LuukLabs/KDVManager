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
        RuleFor(entry => entry.DesiredStartDate).GreaterThanOrEqualTo(entry => entry.DateOfBirth)
            .When(entry => entry.DateOfBirth.HasValue && entry.DesiredStartDate.HasValue);
        RuleFor(entry => entry.Location).MaximumLength(100);
        RuleFor(entry => entry.CareType).IsInEnum().When(entry => entry.CareType.HasValue);
        RuleFor(entry => entry.PreferredGroup).MaximumLength(100);
        RuleFor(entry => entry.Weekdays).NotNull()
            .Must(days => days is null || (days.Length <= 7 && days.Distinct().Count() == days.Length))
            .WithMessage("Choose each weekday at most once.");
        RuleForEach(entry => entry.Weekdays).InclusiveBetween(0, 6);
        RuleFor(entry => entry.StartTime).NotNull().When(entry => entry.EndTime.HasValue);
        RuleFor(entry => entry.EndTime).NotNull().When(entry => entry.StartTime.HasValue);
        RuleFor(entry => entry.EndTime).GreaterThan(entry => entry.StartTime)
            .When(entry => entry.StartTime.HasValue && entry.EndTime.HasValue);
        RuleFor(entry => entry.Priority).InclusiveBetween(0, 100);
        RuleFor(entry => entry.PriorityReason).MaximumLength(100)
            .NotEmpty().When(entry => entry.Priority > 0, ApplyConditionTo.CurrentValidator);
        RuleFor(entry => entry.PriorityExplanation).MaximumLength(1000)
            .NotEmpty().When(entry => entry.Priority > 0, ApplyConditionTo.CurrentValidator);
    }
}
