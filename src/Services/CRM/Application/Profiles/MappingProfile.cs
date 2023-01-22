using System;
using AutoMapper;
using KDVManager.Services.CRM.Application.Contracts.Pagination;
using KDVManager.Services.CRM.Application.Features.Children.Commands.CreateChild;
using KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList;
using KDVManager.Services.CRM.Application.Features.People.Commands.AddPerson;
using KDVManager.Services.CRM.Application.Features.People.Queries.GetPersonList;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Child, ChildListVM>()
                .ForMember(ChildListVM => ChildListVM.FullName, opt => opt.MapFrom(child => (child.GivenName + " " + child.FamilyName).Trim()));
            CreateMap<Child, CreateChildCommand>().ReverseMap();
            CreateMap<GetChildListQuery, PageParameters>();
            CreateMap<Person, PersonListVM>()
                .ForMember(PersonListVM => PersonListVM.FullName, opt => opt.MapFrom(person => (person.GivenName + " " + person.FamilyName).Trim()));
            CreateMap<Person, AddPersonCommand>().ReverseMap();
            CreateMap<GetPersonListQuery, PageParameters>();
        }
    }
}
