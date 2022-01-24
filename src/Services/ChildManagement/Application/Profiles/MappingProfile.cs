using System;
using AutoMapper;
using KDVManager.Services.ChildManagement.Application.Contracts.Pagination;
using KDVManager.Services.ChildManagement.Application.Features.Children.Commands.CreateChild;
using KDVManager.Services.ChildManagement.Application.Features.Children.Queries.GetChildList;
using KDVManager.Services.ChildManagement.Domain.Entities;

namespace KDVManager.Services.ChildManagement.Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Child, ChildListVM>()
                .ForMember(ChildListVM => ChildListVM.FullName, opt => opt.MapFrom(child => (child.GivenName + " " + child.FamilyName).Trim()));
            CreateMap<Child, CreateChildCommand>().ReverseMap();
            CreateMap<GetChildListQuery, PageParameters>();
        }
    }
}
