using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.UpdateTimeSlot;

public class UpdateTimeSlotCommandValidator : AbstractValidator<UpdateTimeSlotCommand>
{
    private readonly ITimeSlotRepository _timeSlotRepository;

    public UpdateTimeSlotCommandValidator(ITimeSlotRepository timeSlotRepository)
    {
        _timeSlotRepository = timeSlotRepository;

        RuleFor(updateTimeSlotCommand => updateTimeSlotCommand.Id)
            .NotEmpty()
            .NotNull()
            .MustAsync(TimeSlotExists)
            .WithErrorCode("TSNE001")
            .WithMessage("TimeSlot with this ID does not exist.");

        RuleFor(updateTimeSlotCommand => updateTimeSlotCommand.Name)
            .NotEmpty()
            .NotNull()
            .MaximumLength(25);

        RuleFor(updateTimeSlotCommand => updateTimeSlotCommand.Name)
            .MustAsync(TimeSlotNameUniqueForUpdate)
            .WithErrorCode("TSNU001")
            .WithMessage("A time slot with the same name already exists.");

        RuleFor(updateTimeSlotCommand => updateTimeSlotCommand.StartTime)
            .NotEmpty()
            .NotNull();

        RuleFor(updateTimeSlotCommand => updateTimeSlotCommand.EndTime)
            .NotEmpty()
            .NotNull();

        RuleFor(updateTimeSlotCommand => updateTimeSlotCommand.EndTime)
            .GreaterThan(updateTimeSlotCommand => updateTimeSlotCommand.StartTime)
            .WithErrorCode("TSEV001")
            .WithMessage("EndTime must be after StartTime.");
    }

    private async Task<bool> TimeSlotExists(Guid id, CancellationToken token)
    {
        return await _timeSlotRepository.ExistsAsync(id);
    }

    private async Task<bool> TimeSlotNameUniqueForUpdate(UpdateTimeSlotCommand command, string name, CancellationToken token)
    {
        return await _timeSlotRepository.IsTimeSlotNameUniqueExcludingId(name, command.Id);
    }
}
