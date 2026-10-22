using FluentValidation;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Waitlist;

public class UpdateWaitlistEntryStatusCommandHandler(IWaitlistEntryRepository repository)
{
    public async Task Handle(Guid id, UpdateWaitlistEntryStatusCommand request, string actor)
    {
        var validator = new InlineValidator<UpdateWaitlistEntryStatusCommand>();
        validator.RuleFor(command => command.Status).NotNull().IsInEnum();
        validator.RuleFor(command => command.Revision).NotNull();
        var validation = await validator.ValidateAsync(request);
        if (!validation.IsValid) throw new Exceptions.ValidationException(validation);
        var entry = await repository.GetByIdAsync(id);
        if (entry is null) throw new Exceptions.NotFoundException(nameof(WaitlistEntry), id);
        if (entry.Revision != request.Revision) throw new Exceptions.ConflictException(nameof(WaitlistEntry), id);
        entry.ChangeStatus(request.Status!.Value, actor, DateTimeOffset.UtcNow);
        await repository.UpdateAsync(entry);
    }
}
