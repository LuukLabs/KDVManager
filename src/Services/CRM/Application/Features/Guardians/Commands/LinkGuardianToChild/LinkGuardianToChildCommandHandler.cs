using System;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Commands.LinkGuardianToChild
{
    public class LinkGuardianToChildCommandHandler
    {
        private readonly IGuardianRepository _guardianRepository;
        private readonly IChildRepository _childRepository;
        private readonly IChildGuardianRepository _childGuardianRepository;

        public LinkGuardianToChildCommandHandler(
            IGuardianRepository guardianRepository,
            IChildRepository childRepository,
            IChildGuardianRepository childGuardianRepository)
        {
            _guardianRepository = guardianRepository;
            _childRepository = childRepository;
            _childGuardianRepository = childGuardianRepository;
        }

        public async Task Handle(LinkGuardianToChildCommand command)
        {
            var guardian = await _guardianRepository.GetByIdAsync(command.GuardianId);
            if (guardian == null)
            {
                throw new ArgumentException($"Guardian with ID {command.GuardianId} not found");
            }

            var child = await _childRepository.GetByIdAsync(command.ChildId);
            if (child == null)
            {
                throw new ArgumentException($"Child with ID {command.ChildId} not found");
            }

            // Check if relationship already exists
            var existingRelationship = await _childGuardianRepository.GetRelationshipAsync(command.ChildId, command.GuardianId);
            if (existingRelationship != null)
            {
                throw new InvalidOperationException($"Guardian {command.GuardianId} is already linked to child {command.ChildId}");
            }

            var childGuardian = new ChildGuardian
            {
                ChildId = command.ChildId,
                GuardianId = command.GuardianId,
                RelationshipType = command.RelationshipType,
                IsPrimaryContact = command.IsPrimaryContact,
                IsEmergencyContact = command.IsEmergencyContact
            };

            await _childGuardianRepository.AddAsync(childGuardian);
        }
    }
}
