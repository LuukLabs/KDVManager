using System;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.CreateChild
{
    public class CreateChildCommandHandler
    {
        private readonly IChildRepository _childRepository;

        public CreateChildCommandHandler(IChildRepository childRepository)
        {
            _childRepository = childRepository;
        }

        public async Task<Guid> Handle(CreateChildCommand request)
        {
            var validator = new CreateChildCommandValidator();
            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
                throw new Exceptions.ValidationException(validationResult);

            var child = new Child
            {
                Id = Guid.NewGuid(),
                GivenName = request.GivenName,
                FamilyName = request.FamilyName,
                DateOfBirth = request.DateOfBirth,
                CID = request.CID,
                TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f") // Default tenant ID for now
            };

            child = await _childRepository.AddAsync(child);

            return child.Id;
        }
    }
}
