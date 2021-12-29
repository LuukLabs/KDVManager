using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.GroupManagement.Application.Contracts.Persistence;
using KDVManager.Services.GroupManagement.Domain;
using MediatR;

namespace KDVManager.Services.GroupManagement.Application.Features.Groups.Commands.CreateGroup
{
    public class CreateGroupCommandHandler : IRequestHandler<CreateGroupCommand, Guid>
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IMapper _mapper;

        public CreateGroupCommandHandler(IGroupRepository groupRepository, IMapper mapper)
        {
            _groupRepository = groupRepository;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(CreateGroupCommand request, CancellationToken cancellationToken)
        {
            var validator = new CreateGroupCommandValidator(_groupRepository);
            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
                throw new Exceptions.ValidationException(validationResult);

            var group = _mapper.Map<Group>(request);

            group = await _groupRepository.AddAsync(group);

            return group.Id;
        }
    }
}
