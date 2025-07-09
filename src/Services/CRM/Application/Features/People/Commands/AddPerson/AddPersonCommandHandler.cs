using System;
using System.Threading.Tasks;
using KDVManager.Services.CRM.Application.Contracts.Persistence;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.People.Commands.AddPerson;

public class AddPersonCommandHandler
{
    private readonly IPersonRepository _personRepository;

    public AddPersonCommandHandler(IPersonRepository personRepository)
    {
        _personRepository = personRepository;
    }

    public async Task<Guid> Handle(AddPersonCommand request)
    {
        var validator = new AddPersonCommandValidator();
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var person = new Person
        {
            Id = Guid.NewGuid(),
            GivenName = request.GivenName,
            FamilyName = request.FamilyName,
            DateOfBirth = request.DateOfBirth,
            Email = request.Email,
            BSN = request.BSN,
            PhoneNumber = request.PhoneNumber,
            TenantId = Guid.Parse("7e520828-45e6-415f-b0ba-19d56a312f7f") // Default tenant ID for now
        };

        person = await _personRepository.AddAsync(person);

        return person.Id;
    }
}
