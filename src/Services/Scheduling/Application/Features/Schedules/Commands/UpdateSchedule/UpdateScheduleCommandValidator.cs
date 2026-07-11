using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.UpdateSchedule;

public class UpdateScheduleCommandValidator : AbstractValidator<UpdateScheduleCommand>
{
    private readonly ITimeSlotRepository _timeSlotRepository;
    private readonly IGroupRepository _groupRepository;
    private readonly IScheduleRepository _scheduleRepository;
    private readonly Guid _childId;
    private readonly Guid _scheduleId;

    public UpdateScheduleCommandValidator(
        ITimeSlotRepository timeSlotRepository,
        IGroupRepository groupRepository,
        IScheduleRepository scheduleRepository,
        Guid childId,
        Guid scheduleId)
    {
        _timeSlotRepository = timeSlotRepository;
        _groupRepository = groupRepository;
        _scheduleRepository = scheduleRepository;
        _childId = childId;
        _scheduleId = scheduleId;

        RuleFor(command => command.StartDate)
            .NotEmpty()
            .MustAsync(BeUniqueStartDate)
            .WithMessage("A schedule with the same start date already exists for this child.");

        RuleFor(command => command.ScheduleRules)
            .NotEmpty()
            .Must(ContainNoDuplicateRules)
            .WithMessage("A schedule cannot contain the same day, time slot and group more than once.");

        RuleForEach(command => command.ScheduleRules)
            .ChildRules(rule =>
            {
                rule.RuleFor(scheduleRule => scheduleRule.Day)
                    .IsInEnum();

                rule.RuleFor(scheduleRule => scheduleRule.TimeSlotId)
                    .NotEmpty()
                    .MustAsync(TimeSlotExists)
                    .WithMessage("The specified time slot does not exist.");

                rule.RuleFor(scheduleRule => scheduleRule.GroupId)
                    .NotEmpty()
                    .MustAsync(GroupExists)
                    .WithMessage("The specified group does not exist.");
            });
    }

    private Task<bool> TimeSlotExists(Guid timeSlotId, CancellationToken cancellationToken)
        => _timeSlotRepository.ExistsAsync(timeSlotId);

    private Task<bool> GroupExists(Guid groupId, CancellationToken cancellationToken)
        => _groupRepository.ExistsAsync(groupId);

    private async Task<bool> BeUniqueStartDate(DateOnly startDate, CancellationToken cancellationToken)
        => !await _scheduleRepository.ExistsWithStartDateExceptAsync(_childId, startDate, _scheduleId);

    private static bool ContainNoDuplicateRules(ICollection<UpdateScheduleCommand.UpdateScheduleCommandScheduleRule>? rules)
    {
        return rules == null || rules
            .GroupBy(rule => new { rule.Day, rule.TimeSlotId, rule.GroupId })
            .All(group => group.Count() == 1);
    }
}
