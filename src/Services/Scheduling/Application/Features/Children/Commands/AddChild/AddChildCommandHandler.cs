using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Features.Children.Commands.AddChild;

public class AddChildCommandHandler
{
    private readonly IChildRepository _childRepository;

    public AddChildCommandHandler(IChildRepository childRepository)
    {
        _childRepository = childRepository;
    }

    public async Task Handle(AddChildCommand command)
    {
        var child = new Child
        {
            Id = command.Id,
            BirthDate = command.BirthDate
        };

        await _childRepository.AddAsync(child);
    }
}
