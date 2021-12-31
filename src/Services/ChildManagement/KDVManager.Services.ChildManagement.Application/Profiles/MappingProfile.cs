using System;
using AutoMapper;
using KDVManager.Services.ChildManagement.Application.Features.Children.Commands.CreateChild;
using KDVManager.Services.ChildManagement.Application.Features.Children.Queries.GetChildList;
using KDVManager.Services.ChildManagement.Domain.Entities;

namespace KDVManager.Services.ChildManagement.Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Child, ChildListVM>().ReverseMap();
            CreateMap<Child, CreateChildCommand>().ReverseMap();
        }
    }
}
