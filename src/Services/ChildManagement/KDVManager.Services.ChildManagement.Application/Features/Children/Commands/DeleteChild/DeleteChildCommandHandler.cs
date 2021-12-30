using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.ChildManagement.Application.Contracts.Persistence;
using KDVManager.Services.ChildManagement.Domain.Entities;
using MediatR;

namespace KDVManager.Services.ChildManagement.Application.Features.Children.Commands.DeleteChild
{
    public class DeleteChildCommandHandler : IRequestHandler<DeleteChildCommand>
    {
        private readonly IAsyncRepository<Child> _childRepository;
        private readonly IMapper _mapper;

        public DeleteChildCommandHandler(IAsyncRepository<Child> childRepository, IMapper mapper)
        {
            _childRepository = childRepository;
            _mapper = mapper;
        }

        public async Task<Unit> Handle(DeleteChildCommand request, CancellationToken cancellationToken)
        {
            var childToDelete = await _childRepository.GetByIdAsync(request.Id);

            await _childRepository.DeleteAsync(childToDelete);

            return Unit.Value;
        }
    }
}
