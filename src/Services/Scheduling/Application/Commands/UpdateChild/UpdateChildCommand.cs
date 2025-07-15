using System;

namespace KDVManager.Services.Scheduling.Application.Commands.UpdateChild
{
    public class UpdateChildCommand
    {
        public Guid Id { get; set; }
        public DateTime BirthDate { get; set; }
    }
}
