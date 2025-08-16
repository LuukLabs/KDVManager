using System;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Guardians.Queries.GetGuardianChildren
{
    public class GuardianChildVM
    {
        public Guid ChildId { get; set; }
        public required string FullName { get; set; }
        public string? CID { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public int Age { get; set; }
        public GuardianRelationshipType RelationshipType { get; set; }
        public bool IsPrimaryContact { get; set; }
        public bool IsEmergencyContact { get; set; }
        public bool IsArchived { get; set; }
    }
}
