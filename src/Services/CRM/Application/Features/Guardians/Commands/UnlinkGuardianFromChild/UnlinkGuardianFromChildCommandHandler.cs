using System;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Commands.UnlinkGuardianFromChild
{
    public class UnlinkGuardianFromChildCommandHandler
    {
        private readonly IChildGuardianRepository _childGuardianRepository;

        public UnlinkGuardianFromChildCommandHandler(IChildGuardianRepository childGuardianRepository)
        {
            _childGuardianRepository = childGuardianRepository;
        }

        public async Task Handle(UnlinkGuardianFromChildCommand command)
        {
            var relationship = await _childGuardianRepository.GetRelationshipAsync(command.ChildId, command.GuardianId);

            if (relationship == null)
            {
                throw new ArgumentException($"No relationship found between child {command.ChildId} and guardian {command.GuardianId}");
            }

            await _childGuardianRepository.DeleteAsync(relationship);
        }
    }
}
