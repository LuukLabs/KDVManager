using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetChildGuardians
{
    public class ChildGuardianVM
    {
        public Guid GuardianId { get; set; }
        public required string FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public GuardianRelationshipType RelationshipType { get; set; }
        public bool IsPrimaryContact { get; set; }
        public bool IsEmergencyContact { get; set; }
    }

}
