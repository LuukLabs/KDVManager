using System;
namespace KDVManager.Services.GroupManagement.Application.Exceptions
{
    public class BadRequestException: ApplicationException
    {
        public BadRequestException(string message): base(message)
        {
        }
    }
}
