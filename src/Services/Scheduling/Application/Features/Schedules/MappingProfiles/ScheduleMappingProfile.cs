using AutoMapper;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetChildSchedules;

namespace KDVManager.Services.Scheduling.Application.Features.Schedules.MappingProfiles;

public class ScheduleMappingProfile : Profile
{
    public ScheduleMappingProfile()
    {
        CreateMap<Schedule, ChildScheduleListVM>();

        CreateMap<ScheduleRule, ChildScheduleListVM.ChildScheduleListVMScheduleRule>()
            .ForMember(dest => dest.TimeSlotName, opt => opt.MapFrom(src => src.TimeSlot.Name))
            .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.TimeSlot.StartTime))
            .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.TimeSlot.EndTime));
    }
}
