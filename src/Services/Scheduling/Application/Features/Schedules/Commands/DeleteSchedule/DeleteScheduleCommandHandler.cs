using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Application.Exceptions;
using KDVManager.Services.Scheduling.Domain.Entities;
using MediatR;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.DeleteSchedule;

public class DeleteScheduleCommandHandler : IRequestHandler<DeleteScheduleCommand>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IMapper _mapper;

    public DeleteScheduleCommandHandler(IScheduleRepository scheduleRepository, IMapper mapper)
    {
        _scheduleRepository = scheduleRepository;
        _mapper = mapper;
    }

    public async Task Handle(DeleteScheduleCommand request, CancellationToken cancellationToken)
    {
        var scheduleToDelete = await _scheduleRepository.GetByIdAsync(request.Id);

        if (scheduleToDelete == null)
        {
            throw new NotFoundException(nameof(Schedule), request.Id);
        }

        await _scheduleRepository.DeleteAsync(scheduleToDelete);
    }
}
