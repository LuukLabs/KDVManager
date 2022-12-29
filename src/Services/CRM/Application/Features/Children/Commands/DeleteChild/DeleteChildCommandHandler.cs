using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.CRM.Application.Contracts.Infrastructure;
using KDVManager.Services.CRM.Application.Exceptions;
using KDVManager.Services.CRM.Domain.Entities;
using MediatR;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.DeleteChild
{
    public class DeleteChildCommandHandler : IRequestHandler<DeleteChildCommand>
    {
        private readonly IChildRepository _childRepository;
        private readonly IMapper _mapper;

        public DeleteChildCommandHandler(IChildRepository childRepository, IMapper mapper)
        {
            _childRepository = childRepository;
            _mapper = mapper;
        }

        public async Task<Unit> Handle(DeleteChildCommand request, CancellationToken cancellationToken)
        {
            var childToDelete = await _childRepository.GetByIdAsync(request.Id);

            if (childToDelete == null)
            {
                throw new NotFoundException(nameof(Child), request.Id);
            }

            await _childRepository.DeleteAsync(childToDelete);

            return Unit.Value;
        }
    }
}
