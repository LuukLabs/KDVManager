using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;
using MediatR;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild
{
    public class UpdateChildCommandHandler : IRequestHandler<UpdateChildCommand>
    {
        private readonly IChildRepository _childRepository;
        private readonly IMapper _mapper;

        public UpdateChildCommandHandler(IChildRepository childRepository, IMapper mapper)
        {
            _childRepository = childRepository;
            _mapper = mapper;
        }

        public async Task Handle(UpdateChildCommand request, CancellationToken cancellationToken)
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

            _mapper.Map(request, child);

            await _childRepository.UpdateAsync(child);
        }
    }
}
