using System;
namespace KDVManager.Services.PlatformManagement.Application.Exceptions;

public class ConflictException : ApplicationException
{
    public ConflictException(string name, object key) : base($"{name} ({key}) is in conflict")
    {
    }
}
