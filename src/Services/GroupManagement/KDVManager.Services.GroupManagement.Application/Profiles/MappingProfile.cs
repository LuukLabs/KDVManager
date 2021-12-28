using System;
using AutoMapper;
using KDVManager.Services.GroupManagement.Application.Features.Groups.Commands.CreateGroup;
using KDVManager.Services.GroupManagement.Application.Features.Groups.Queries.GetGroupDetail;
using KDVManager.Services.GroupManagement.Application.Features.Groups.Queries.GetGroupList;
using KDVManager.Services.GroupManagement.Domain;

namespace KDVManager.Services.GroupManagement.Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            _ = CreateMap<Group, GroupListVM>().ReverseMap();
            CreateMap<Group, GroupDetailVM>().ReverseMap();
            CreateMap<Group, CreateGroupCommand>().ReverseMap();
        }
    }
}
