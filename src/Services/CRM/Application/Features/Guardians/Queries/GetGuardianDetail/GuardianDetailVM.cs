using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianDetail
{
    public class GuardianDetailVM
    {
        public Guid Id { get; set; }
        public required string GivenName { get; set; }
        public required string FamilyName { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Email { get; set; }
        public List<PhoneNumberVM> PhoneNumbers { get; set; } = [];
        public List<ChildRelationshipVM> Children { get; set; } = [];
    }

    public class PhoneNumberVM
    {
        public Guid Id { get; set; }
        public string Number { get; set; } = string.Empty;
        public PhoneNumberType Type { get; set; }
    }

    public class ChildRelationshipVM
    {
        public Guid ChildId { get; set; }
        public required string ChildName { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public GuardianRelationshipType RelationshipType { get; set; }
        public bool IsPrimaryContact { get; set; }
        public bool IsEmergencyContact { get; set; }
    }
}
