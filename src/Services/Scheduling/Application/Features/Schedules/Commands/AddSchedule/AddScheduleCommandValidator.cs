using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.AddSchedule;

public class AddScheduleCommandValidator : AbstractValidator<AddScheduleCommand>
{
    private readonly ITimeSlotRepository _timeSlotRepository;
    private readonly IScheduleRepository _scheduleRepository;

    public AddScheduleCommandValidator(ITimeSlotRepository timeSlotRepository, IScheduleRepository scheduleRepository)
    {
        _timeSlotRepository = timeSlotRepository;
        _scheduleRepository = scheduleRepository;

        RuleFor(AddScheduleCommand => AddScheduleCommand.ChildId)
            .NotEmpty()
            .NotNull();

        RuleFor(c => c.StartDate)
            .NotEmpty()
            .NotNull()
            .MustAsync(BeUniqueStartDate)
            .WithMessage("A schedule with the same start date already exists for this child.");


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

                rule.RuleFor(r => r.GroupId)
                    .NotEmpty()
                    .NotNull();
            });
    }

    private async Task<bool> TimeSlotExists(Guid timeSlotId, CancellationToken cancellationToken)
    {
        return await _timeSlotRepository.ExistsAsync(timeSlotId);
    }

    private async Task<bool> BeUniqueStartDate(AddScheduleCommand command, DateOnly startDate, CancellationToken ct)
    {
        return !await _scheduleRepository.ExistsWithStartDateAsync(command.ChildId, startDate);
    }
}
