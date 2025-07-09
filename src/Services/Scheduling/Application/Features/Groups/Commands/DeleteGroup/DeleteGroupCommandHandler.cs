using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Exceptions;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Commands.DeleteGroup;

public class DeleteGroupCommandHandler
{
    private readonly IGroupRepository _groupRepository;

    public DeleteGroupCommandHandler(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
    }

    public async Task Handle(DeleteGroupCommand request)
    {
        var groupToDelete = await _groupRepository.GetByIdAsync(request.Id);

        if (groupToDelete == null)
        {
            throw new NotFoundException(nameof(Group), request.Id);
        }

        await _groupRepository.DeleteAsync(groupToDelete);
    }
}
