using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Application.Exceptions;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Shared.Contracts.Events;
using MassTransit;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.DeleteChild;

public class DeleteChildCommandHandler
{
    private readonly IChildRepository _childRepository;
    private readonly IPublishEndpoint _publishEndpoint;

    public DeleteChildCommandHandler(IChildRepository childRepository, IPublishEndpoint publishEndpoint)
    {
        _childRepository = childRepository;
        _publishEndpoint = publishEndpoint;
    }

    public async Task Handle(DeleteChildCommand request)
    {
        var childToDelete = await _childRepository.GetByIdAsync(request.Id);

        if (childToDelete == null)
        {
            throw new NotFoundException(nameof(Child), request.Id);
        }

        await _childRepository.DeleteAsync(childToDelete);

        // Publish event
        await _publishEndpoint.Publish(new ChildDeletedEvent
        {
            ChildId = childToDelete.Id
        });
    }
}
