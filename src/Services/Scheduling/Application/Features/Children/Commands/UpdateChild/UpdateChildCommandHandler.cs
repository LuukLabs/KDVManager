using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Children.Commands.UpdateChild;

public class UpdateChildCommandHandler
{
    private readonly IChildRepository _childRepository;

    public UpdateChildCommandHandler(IChildRepository childRepository)
    {
        _childRepository = childRepository;
    }

    public async Task Handle(UpdateChildCommand command)
    {
        var child = await _childRepository.GetByIdAsync(command.Id);
        if (child == null)
        {
            return; // Ignore if child doesn't exist
        }

        child.DateOfBirth = command.DateOfBirth;
        child.GivenName = command.GivenName;
        child.FamilyName = command.FamilyName;

        await _childRepository.UpdateAsync(child);
    }
}
