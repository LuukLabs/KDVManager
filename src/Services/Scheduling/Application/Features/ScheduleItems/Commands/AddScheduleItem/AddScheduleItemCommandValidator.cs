using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.ScheduleItems.Commands.AddScheduleItem;

public class AddScheduleItemCommandValidator : AbstractValidator<AddScheduleItemCommand>
{
    private readonly IScheduleItemRepository _scheduleItemRepository;

    public AddScheduleItemCommandValidator(IScheduleItemRepository scheduleItemRepository)
    {
        _scheduleItemRepository = scheduleItemRepository;

        RuleFor(AddScheduleItemCommand => AddScheduleItemCommand.ChildId)
            .NotEmpty()
            .NotNull();

        RuleFor(AddScheduleItemCommand => AddScheduleItemCommand.StartDate)
            .NotEmpty()
            .NotNull();

        RuleFor(AddScheduleItemCommand => AddScheduleItemCommand.EndDate)
            .GreaterThan(AddScheduleItemCommand => AddScheduleItemCommand.StartDate)
            .When(AddScheduleItemCommand => AddScheduleItemCommand.EndDate.HasValue);
    }
}
