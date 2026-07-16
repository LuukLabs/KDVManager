namespace KDVManager.Services.Tenants.Domain.Interfaces
{
    public interface IPaginationFilter
    {
        int PageNumber { get; }
        int PageSize { get; }
    }
}
