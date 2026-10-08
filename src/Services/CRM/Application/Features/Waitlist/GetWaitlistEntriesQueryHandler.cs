using FluentValidation;
using KDVManager.Services.CRM.Application.Contracts.Persistence;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class GetWaitlistEntriesQueryHandler(IWaitlistEntryRepository waitlistEntryRepository)
{
    public async Task<IReadOnlyList<WaitlistEntryVM>> Handle(GetWaitlistEntriesQuery request)
    {
        var validator = new InlineValidator<GetWaitlistEntriesQuery>();
        validator.RuleFor(query => query.Location).MaximumLength(100);
        validator.RuleFor(query => query.Status).IsInEnum().When(query => query.Status.HasValue);
        validator.RuleFor(query => query.StartMonth).Must(date => !date.HasValue || date.Value.Day == 1)
            .WithMessage("Use the first day of the start month.");
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid) throw new Exceptions.ValidationException(validation);
        var entries = await waitlistEntryRepository.ListAsync(request.IncludeClosed ?? false,
            request.Location?.Trim(), request.StartMonth, request.Status);
        return entries.Select(WaitlistEntryMapping.ToVm).ToList();
    }
}
