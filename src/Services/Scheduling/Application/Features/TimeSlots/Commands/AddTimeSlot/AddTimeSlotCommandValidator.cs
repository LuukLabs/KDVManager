﻿using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.AddTimeSlot;

public class AddTimeSlotCommandValidator : AbstractValidator<AddTimeSlotCommand>
{
    private readonly ITimeSlotRepository _timeSlotRepository;

    public AddTimeSlotCommandValidator(ITimeSlotRepository timeSlotRepository)
    {
        _timeSlotRepository = timeSlotRepository;

        RuleFor(addTimeSlotCommand => addTimeSlotCommand.Name)
            .NotEmpty()
            .NotNull()
            .MaximumLength(25);

        RuleFor(addTimeSlotCommand => addTimeSlotCommand.Name)
            .MustAsync(TimeSlotNameUnique)
            .WithErrorCode("TSNU001")
            .WithMessage("An group with the same name already exists.");

        RuleFor(addTimeSlotCommand => addTimeSlotCommand.StartTime)
            .NotEmpty()
            .NotNull();

        RuleFor(addTimeSlotCommand => addTimeSlotCommand.EndTime)
            .NotEmpty()
            .NotNull();

        RuleFor(addTimeSlotCommand => addTimeSlotCommand.EndTime)
            .GreaterThan(addTimeSlotCommand => addTimeSlotCommand.StartTime)
            .WithErrorCode("TSEV001")
            .WithMessage("EndTime must be after StartTime.");
    }

    private async Task<bool> TimeSlotNameUnique(string name, CancellationToken token)
    {
        return !(await _timeSlotRepository.IsTimeSlotNameUnique(name));
    }
}
