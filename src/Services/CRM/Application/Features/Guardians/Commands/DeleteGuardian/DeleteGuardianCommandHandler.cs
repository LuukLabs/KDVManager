using System;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Commands.DeleteGuardian
{
    public class DeleteGuardianCommandHandler
    {
        private readonly IGuardianRepository _guardianRepository;
        private readonly IChildGuardianRepository _childGuardianRepository;

        public DeleteGuardianCommandHandler(IGuardianRepository guardianRepository, IChildGuardianRepository childGuardianRepository)
        {
            _guardianRepository = guardianRepository;
            _childGuardianRepository = childGuardianRepository;
        }

        public async Task Handle(DeleteGuardianCommand command)
        {
            var guardian = await _guardianRepository.GetByIdWithRelationshipsAsync(command.Id);

            if (guardian == null)
            {
                throw new ArgumentException($"Guardian with ID {command.Id} not found");
            }

            // Check if guardian has any children relationships
            if (await _childGuardianRepository.IsGuardianLinkedAsync(command.Id))
            {
                throw new InvalidOperationException($"Cannot delete guardian {command.Id} as they have active relationships with children. Please remove all child relationships first.");
            }

            await _guardianRepository.DeleteAsync(guardian);
        }
    }
}
