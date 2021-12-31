using System;
namespace KDVManager.Services.ChildManagement.Application.Features.Children.Queries.GetChildList
{
    public class ChildListVM
    {
        public Guid Id { get; set; }
        public string GivenName { get; set; }
        public string FamilyName { get; set; }
    }
}
