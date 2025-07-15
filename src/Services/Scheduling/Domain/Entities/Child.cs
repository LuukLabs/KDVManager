using System;
using KDVManager.Services.Scheduling.Domain.Interfaces;

namespace KDVManager.Services.Scheduling.Domain.Entities
{
    public class Child : IMustHaveTenant
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public DateOnly BirthDate { get; set; }
    }
}
