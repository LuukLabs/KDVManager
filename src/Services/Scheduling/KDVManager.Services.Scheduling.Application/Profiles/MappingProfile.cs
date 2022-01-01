using System;
using AutoMapper;
using KDVManager.Services.Scheduling.Application.Features.Groups.Commands.CreateGroup;
using KDVManager.Services.Scheduling.Application.Features.Groups.Queries.GetGroupDetail;
using KDVManager.Services.Scheduling.Application.Features.Groups.Queries.GetGroupList;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Group, GroupListVM>().ReverseMap();
            CreateMap<Group, GroupDetailVM>().ReverseMap();
            CreateMap<Group, CreateGroupCommand>().ReverseMap();
        }
    }
}
