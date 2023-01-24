using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using MediatR;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.CreateChild
{
    public class CreateChildCommandHandler : IRequestHandler<CreateChildCommand, Guid>
    {
        private readonly IChildRepository _childRepository;
        private readonly IMapper _mapper;

        public CreateChildCommandHandler(IChildRepository childRepository, IMapper mapper)
        {
            _childRepository = childRepository;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(CreateChildCommand request, CancellationToken cancellationToken)
        {
            var validator = new CreateChildCommandValidator();
            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
                throw new Exceptions.ValidationException(validationResult);

            var child = _mapper.Map<Child>(request);

            child = await _childRepository.AddAsync(child);

            return child.Id;
        }
    }
}
