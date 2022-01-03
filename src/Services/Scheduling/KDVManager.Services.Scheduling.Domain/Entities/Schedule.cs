using System;

namespace KDVManager.Services.Scheduling.Domain.Entities
{
    public class Schedule
    {
        public Guid Id { get; set; }

        public Child Child { get; set; }

        public Group Group { get; set; }
    }
}
