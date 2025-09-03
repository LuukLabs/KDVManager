using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Application.Exceptions;

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
                throw new NotFoundException(nameof(Domain.Entities.Guardian), command.Id);
            }

            // Check if guardian has any children relationships -> treat as conflict (409)
            if (await _childGuardianRepository.IsGuardianLinkedAsync(command.Id))
            {
                throw new ConflictException(nameof(Domain.Entities.Guardian), command.Id);
            }

            await _guardianRepository.DeleteAsync(guardian);
        }
    }
}
