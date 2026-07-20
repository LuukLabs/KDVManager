using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Shared.Contracts.Events;
using MassTransit;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild
{
    public class UpdateChildCommandHandler
    {
        private readonly IChildRepository _childRepository;
        private readonly IPublishEndpoint _publishEndpoint;

        public UpdateChildCommandHandler(IChildRepository childRepository, IPublishEndpoint publishEndpoint)
        {
            _childRepository = childRepository;
            _publishEndpoint = publishEndpoint;
        }

        public async Task Handle(UpdateChildCommand request)
        {
            // Retrieve the existing child entity
            var child = await _childRepository.GetByIdAsync(request.Id);
            if (child == null)
            {
                throw new NotFoundException(nameof(Child), request.Id);
            }

            var validator = new UpdateChildCommandValidator();
            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
                throw new ValidationException(validationResult);

            // Store original birthdate to check if it changed
            var originalDateOfBirth = child.DateOfBirth;

            // Manually map properties
            child.GivenName = request.GivenName!;
            child.FamilyName = request.FamilyName!;
            child.DateOfBirth = (DateOnly)request.DateOfBirth!;
            child.Allergies = request.Allergies;
            child.Medication = request.Medication;
            child.DietaryRequirements = request.DietaryRequirements;
            child.MedicalNotes = request.MedicalNotes;

            await _childRepository.UpdateAsync(child);

            await _publishEndpoint.Publish(new ChildUpdatedEvent
            {
                ChildId = child.Id,
                DateOfBirth = child.DateOfBirth,
                GivenName = child.GivenName,
                FamilyName = child.FamilyName
            });

        }
    }
}
