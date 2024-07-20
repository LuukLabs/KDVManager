using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using KDVManager.Services.Scheduling.Application.Features.Groups.Commands.AddGroup;
using KDVManager.Services.Scheduling.Application.Features.Groups.Queries.ListGroups;
using KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.AddTimeSlot;
using KDVManager.Services.Scheduling.Application.Features.TimeSlots.Queries.ListTimeSlots;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Profiles;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Group, GroupListVM>();
        CreateMap<Group, AddGroupCommand>().ReverseMap();
        CreateMap<ListGroupsQuery, PageParameters>();

        CreateMap<TimeSlot, TimeSlotListVM>();
        CreateMap<TimeSlot, AddTimeSlotCommand>().ReverseMap();
        CreateMap<ListTimeSlotsQuery, PageParameters>();
    }
}

