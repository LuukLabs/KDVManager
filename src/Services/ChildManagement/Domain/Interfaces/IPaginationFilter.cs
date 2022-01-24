namespace KDVManager.Services.ChildManagement.Domain.Interfaces
{
    public interface IPaginationFilter
    {
        int PageNumber { get; }
        int PageSize { get; }
    }
}
