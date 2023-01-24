using System;

namespace KDVManager.Services.CRM.Application.Features.People.Queries.GetPersonList;

public class PersonListVM
{
    public Guid Id { get; set; }

    public string FullName { get; set; }

    public DateTime DateOfBirth { get; set; }

    public string Email { get; set; }

    public string BSN { get; set; }

    public string PhoneNumber { get; set; }
}
