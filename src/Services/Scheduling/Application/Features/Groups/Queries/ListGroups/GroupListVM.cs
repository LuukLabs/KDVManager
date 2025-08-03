using System;
using System.ComponentModel.DataAnnotations;

namespace KDVManager.Services.Scheduling.Application.Features.Groups.Queries.ListGroups;

public class GroupListVM
{
    [Required]
    public Guid Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

}

