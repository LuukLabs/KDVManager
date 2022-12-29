namespace KDVManager.Services.CRM.Domain.Interfaces
{
    public interface IPaginationFilter
    {
        int PageNumber { get; }
        int PageSize { get; }
    }
}
