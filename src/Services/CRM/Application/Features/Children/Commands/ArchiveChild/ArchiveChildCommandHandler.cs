using System;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Application.Exceptions;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.ArchiveChild
{
    public class ArchiveChildCommandHandler
    {
        private readonly IChildRepository _childRepository;

        public ArchiveChildCommandHandler(IChildRepository childRepository)
        {
            _childRepository = childRepository;
        }

        public async Task Handle(ArchiveChildCommand request)
        {
            var child = await _childRepository.GetByIdAsync(request.Id);
            if (child == null)
                throw new NotFoundException(nameof(Child), request.Id);

            var wasChanged = child.Archive();

            await _childRepository.UpdateAsync(child);
        }
    }
}

