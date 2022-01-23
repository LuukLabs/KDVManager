using System;
namespace KDVManager.Services.ChildManagement.Application.Exceptions
{
    public class BadRequestException: ApplicationException
    {
        public BadRequestException(string message): base(message)
        {
        }
    }
}
