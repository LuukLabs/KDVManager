using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Application.Exceptions;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.DeleteChild;

public class DeleteChildCommandHandler
{
    private readonly IChildRepository _childRepository;

    public DeleteChildCommandHandler(IChildRepository childRepository)
    {
        _childRepository = childRepository;
    }

    public async Task Handle(DeleteChildCommand request)
    {
        var childToDelete = await _childRepository.GetByIdAsync(request.Id);

        if (childToDelete == null)
        {
            throw new NotFoundException(nameof(Child), request.Id);
        }

        await _childRepository.DeleteAsync(childToDelete);
    }
}
