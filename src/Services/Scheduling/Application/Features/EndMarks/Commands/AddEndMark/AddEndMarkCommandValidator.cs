using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.EndMarks.Commands.AddEndMark;

public class AddEndMarkCommandValidator : AbstractValidator<AddEndMarkCommand>
{
    private readonly IEndMarkRepository _repo;

    public AddEndMarkCommandValidator(IEndMarkRepository repo)
    {
        _repo = repo;

        RuleFor(x => x.ChildId)
            .NotEmpty();

        RuleFor(x => x.EndDate)
            .MustAsync(async (cmd, endDate, token) => await NoDuplicateEndMarkForChild(cmd, endDate, token))
            .WithErrorCode("EMD001")
            .WithMessage("An end mark for the same date already exists for this child.");
    }
    private async Task<bool> NoDuplicateEndMarkForChild(AddEndMarkCommand cmd, DateOnly endDate, CancellationToken token)
    {
        var existing = await _repo.GetByChildIdAsync(cmd.ChildId);
        if (existing == null) return true;

        // Compare DateOnly values for equality
        return !existing.Any(e => e.EndDate == endDate);
    }
}
