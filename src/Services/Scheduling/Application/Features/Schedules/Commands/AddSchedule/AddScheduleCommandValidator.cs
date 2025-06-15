using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.AddSchedule;

public class AddScheduleCommandValidator : AbstractValidator<AddScheduleCommand>
{
    private readonly ITimeSlotRepository _timeSlotRepository;

    public AddScheduleCommandValidator(ITimeSlotRepository timeSlotRepository)
    {
        _timeSlotRepository = timeSlotRepository;

        RuleFor(AddScheduleCommand => AddScheduleCommand.ChildId)
            .NotEmpty()
            .NotNull();

        RuleFor(AddScheduleCommand => AddScheduleCommand.StartDate)
                .NotEmpty()
                .NotNull();

        RuleFor(AddScheduleCommand => AddScheduleCommand.EndDate)
                .GreaterThan(AddScheduleCommand => AddScheduleCommand.StartDate)
                .When(AddScheduleCommand => AddScheduleCommand.EndDate.HasValue);

        RuleFor(AddScheduleCommand => AddScheduleCommand.GroupId)
            .NotEmpty()
            .NotNull();

        RuleFor(AddScheduleCommand => AddScheduleCommand.ScheduleRules)
            .NotEmpty()
            .NotNull();

        RuleForEach(AddScheduleCommand => AddScheduleCommand.ScheduleRules)
            .ChildRules(rule =>
            {
                rule.RuleFor(r => r.Day)
                    .IsInEnum();

                rule.RuleFor(r => r.TimeSlotId)
                    .NotEmpty()
                    .NotEqual(Guid.Empty)
                    .MustAsync(TimeSlotExists)
                    .WithMessage("The specified time slot does not exist.");
            });
    }

    private async Task<bool> TimeSlotExists(Guid timeSlotId, CancellationToken cancellationToken)
    {
        return await _timeSlotRepository.ExistsAsync(timeSlotId);
    }
}
