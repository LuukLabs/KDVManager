using System;
namespace KDVManager.Services.Scheduling.Application.Exceptions
{
    public class BadRequestException: ApplicationException
    {
        public BadRequestException(string message): base(message)
        {
        }
    }
}
