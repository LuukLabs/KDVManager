﻿using System;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetChildList
{
    public class ChildListVM
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }
}
