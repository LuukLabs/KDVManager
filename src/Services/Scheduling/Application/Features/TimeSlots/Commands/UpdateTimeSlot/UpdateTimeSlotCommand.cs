using System;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.UpdateTimeSlot;

public class UpdateTimeSlotCommand
{
    public Guid Id { get; set; }

    public string Name { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }
}
