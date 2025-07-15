using System;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;

namespace KDVManager.Services.Scheduling.Application.Commands.CreateChild
{
    public class CreateChildCommandHandler
    {
        private readonly IChildRepository _childRepository;

        public CreateChildCommandHandler(IChildRepository childRepository)
        {
            _childRepository = childRepository;
        }

        public async Task Handle(CreateChildCommand command)
        {
            var child = new Child
            {
                Id = command.Id,
                BirthDate = command.BirthDate
            };

            await _childRepository.AddAsync(child);
        }
    }
}
