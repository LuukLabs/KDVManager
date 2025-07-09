using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild
{
    public class UpdateChildCommandHandler
    {
        private readonly IChildRepository _childRepository;

        public UpdateChildCommandHandler(IChildRepository childRepository)
        {
            _childRepository = childRepository;
        }

        public async Task Handle(UpdateChildCommand request)
        {
            // Retrieve the existing child entity
            var child = await _childRepository.GetByIdAsync(request.Id);
            if (child == null)
            {
                throw new Exceptions.NotFoundException(nameof(Child), request.Id);
            }

            var validator = new UpdateChildCommandValidator();
            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
                throw new Exceptions.ValidationException(validationResult);

            // Manually map properties
            child.GivenName = request.GivenName;
            child.FamilyName = request.FamilyName;
            child.DateOfBirth = request.DateOfBirth;
            child.CID = request.CID;

            await _childRepository.UpdateAsync(child);
        }
    }
}
