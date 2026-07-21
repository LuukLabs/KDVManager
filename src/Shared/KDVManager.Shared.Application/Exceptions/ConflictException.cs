namespace KDVManager.Shared.Application.Exceptions;

public class ConflictException : Exception
{
    public ConflictException(string name, object key) : base($"{name} ({key}) is in conflict")
    {
    }
}
