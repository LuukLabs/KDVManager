using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.AddSchedule;

public class AddScheduleCommandValidator : AbstractValidator<AddScheduleCommand>
{
    public AddScheduleCommandValidator()
    {

        RuleFor(AddScheduleCommand => AddScheduleCommand.ChildId)
            .NotEmpty()
            .NotNull();

        RuleFor(AddScheduleCommand => AddScheduleCommand.StartDate)
                .NotEmpty()
                .NotNull();

        RuleFor(AddScheduleCommand => AddScheduleCommand.EndDate)
                .GreaterThan(AddScheduleCommand => AddScheduleCommand.StartDate)
                .When(AddScheduleCommand => AddScheduleCommand.EndDate.HasValue);
    }
}
