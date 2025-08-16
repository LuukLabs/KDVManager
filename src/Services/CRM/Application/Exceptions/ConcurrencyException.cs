using System;

namespace KDVManager.Services.CRM.Application.Exceptions
{
    public class ConcurrencyException : ApplicationException
    {
        public ConcurrencyException(string message) : base(message)
        {
        }

        public ConcurrencyException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
