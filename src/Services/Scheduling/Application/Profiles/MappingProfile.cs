﻿using AutoMapper;
using KDVManager.Services.Scheduling.Application.Contracts.Pagination;
using KDVManager.Services.Scheduling.Application.Features.Groups.Commands.AddGroup;
using KDVManager.Services.Scheduling.Application.Features.Groups.Queries.ListGroups;
using KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.AddTimeSlot;
using KDVManager.Services.Scheduling.Application.Features.TimeSlots.Queries.ListTimeSlots;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.AddSchedule;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetChildSchedules;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetSchedulesByDate;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Profiles;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Group Mappings
        CreateMap<Group, GroupListVM>();
        CreateMap<Group, AddGroupCommand>().ReverseMap();
        CreateMap<ListGroupsQuery, PageParameters>();

        // TimeSlot Mappings
        CreateMap<TimeSlot, TimeSlotListVM>();
        CreateMap<TimeSlot, AddTimeSlotCommand>().ReverseMap();
        CreateMap<ListTimeSlotsQuery, PageParameters>();

        // Schedule Mappings
        CreateMap<AddScheduleCommand, Schedule>()
            .ForMember(dest => dest.ScheduleRules, opt => opt.MapFrom(src => src.ScheduleRules));
        CreateMap<AddScheduleCommand.AddScheduleCommandScheduleRule, ScheduleRule>();

        CreateMap<Schedule, ChildScheduleListVM>()
            .ForMember(dest => dest.ScheduleRules, opt => opt.MapFrom(src => src.ScheduleRules));
        CreateMap<ScheduleRule, ChildScheduleListVM.ChildScheduleListVMScheduleRule>()
            .ForMember(dest => dest.TimeSlotName, opt => opt.MapFrom(src => src.TimeSlot.Name))
            .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.TimeSlot.StartTime))
            .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.TimeSlot.EndTime))
            .ForMember(dest => dest.GroupId, opt => opt.MapFrom(src => src.GroupId))
            .ForMember(dest => dest.GroupName, opt => opt.MapFrom(src => src.Group.Name));

        // Map from ScheduleRule to ScheduleByDateVM for nested relationship
        CreateMap<ScheduleRule, ScheduleByDateVM>()
            .ForMember(dest => dest.ScheduleId, opt => opt.MapFrom(src => src.ScheduleId))
            .ForMember(dest => dest.ChildId, opt => opt.MapFrom(src => src.Schedule.ChildId))
            .ForMember(dest => dest.ChildFullName, opt => opt.Ignore())
            .ForMember(dest => dest.TimeSlotName, opt => opt.MapFrom(src => src.TimeSlot.Name))
            .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.TimeSlot.StartTime))
            .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => src.TimeSlot.EndTime))
            .ForMember(dest => dest.GroupId, opt => opt.MapFrom(src => src.GroupId))
            .ForMember(dest => dest.GroupName, opt => opt.MapFrom(src => src.Group.Name));
    }
}

