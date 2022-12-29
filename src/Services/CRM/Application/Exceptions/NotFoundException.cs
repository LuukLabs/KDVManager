using System;
namespace KDVManager.Services.CRM.Application.Exceptions
{
    public class NotFoundException : ApplicationException
    {
        public NotFoundException(string name, object key) : base($"{name} ({key}) is not found")
        {
        }
    }
}
