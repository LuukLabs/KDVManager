using System;

namespace KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.AddTimeSlot;

public class AddTimeSlotCommand
{
    public string Name { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }
}
