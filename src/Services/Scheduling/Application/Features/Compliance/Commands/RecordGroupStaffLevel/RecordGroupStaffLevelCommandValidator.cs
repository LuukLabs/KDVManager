using FluentValidation;

namespace KDVManager.Services.Scheduling.Application.Features.Compliance.Commands.RecordGroupStaffLevel;

public class RecordGroupStaffLevelCommandValidator : AbstractValidator<RecordGroupStaffLevelCommand>
{
    public RecordGroupStaffLevelCommandValidator()
    {
        RuleFor(x => x.GroupId).NotEmpty();
        RuleFor(x => x.QualifiedStaffCount).GreaterThanOrEqualTo(0);
    }
}
