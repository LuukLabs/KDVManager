using System;
namespace KDVManager.Services.CRM.Application.Exceptions
{
    public class BadRequestException: ApplicationException
    {
        public BadRequestException(string message): base(message)
        {
        }
    }
}
