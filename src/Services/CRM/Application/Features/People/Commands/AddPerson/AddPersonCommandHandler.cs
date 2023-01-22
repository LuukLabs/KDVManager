using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.CRM.Application.Contracts.Infrastructure;
using KDVManager.Services.CRM.Domain.Entities;
using MediatR;

namespace KDVManager.Services.CRM.Application.Features.People.Commands.AddPerson
{
    public class AddPersonCommandHandler : IRequestHandler<AddPersonCommand, Guid>
    {
        private readonly IPersonRepository _personRepository;
        private readonly IMapper _mapper;

        public AddPersonCommandHandler(IPersonRepository personRepository, IMapper mapper)
        {
            _personRepository = personRepository;
            _mapper = mapper;
        }

        public async Task<Guid> Handle(AddPersonCommand request, CancellationToken cancellationToken)
        {
            var validator = new AddPersonCommandValidator();
            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
                throw new Exceptions.ValidationException(validationResult);

            var person = _mapper.Map<Person>(request);

            person = await _personRepository.AddAsync(person);

            return person.Id;
        }
    }
}
