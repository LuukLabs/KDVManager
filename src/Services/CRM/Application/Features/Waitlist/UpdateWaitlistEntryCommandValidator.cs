using FluentValidation;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class UpdateWaitlistEntryCommandValidator : AbstractValidator<UpdateWaitlistEntryCommand>
{
    public UpdateWaitlistEntryCommandValidator()
    {
        Include(new CreateWaitlistEntryCommandValidator());
        RuleFor(entry => entry.Revision).NotNull();
    }
}
