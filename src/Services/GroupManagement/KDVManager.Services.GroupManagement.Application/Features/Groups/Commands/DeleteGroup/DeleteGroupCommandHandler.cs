using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.GroupManagement.Application.Contracts.Persistence;
using KDVManager.Services.GroupManagement.Domain;
using MediatR;

namespace KDVManager.Services.GroupManagement.Application.Features.Groups.Commands.DeleteGroup
{
    public class DeleteGroupCommandHandler : IRequestHandler<DeleteGroupCommand>
    {
        private readonly IAsyncRepository<Group> _groupRepository;
        private readonly IMapper _mapper;

        public DeleteGroupCommandHandler(IAsyncRepository<Group> groupRepository, IMapper mapper)
        {
            _groupRepository = groupRepository;
            _mapper = mapper;
        }

        public async Task<Unit> Handle(DeleteGroupCommand request, CancellationToken cancellationToken)
        {
            var groupToDelete = await _groupRepository.GetByIdAsync(request.Id);

             await _groupRepository.DeleteAsync(groupToDelete);

            return Unit.Value;
        }
    }
}
