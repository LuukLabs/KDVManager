using System;

namespace KDVManager.Services.Scheduling.Application.Commands.CreateChild
{
    public class CreateChildCommand
    {
        public Guid Id { get; set; }
        public DateOnly BirthDate { get; set; }
    }
}
