using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Commands.AddGroup;

public class AddGroupCommandHandler : IRequestHandler<AddGroupCommand, Guid>
{
    private readonly IGroupRepository _groupRepository;
    private readonly IMapper _mapper;

    public AddGroupCommandHandler(IGroupRepository groupRepository, IMapper mapper)
    {
        _groupRepository = groupRepository;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(AddGroupCommand request, CancellationToken cancellationToken)
    {
        var validator = new AddGroupCommandValidator(_groupRepository);
        var validationResult = await validator.ValidateAsync(request);

        if (!validationResult.IsValid)
            throw new Exceptions.ValidationException(validationResult);

        var group = _mapper.Map<Group>(request);

        group = await _groupRepository.AddAsync(group);

        return group.Id;
    }
}

