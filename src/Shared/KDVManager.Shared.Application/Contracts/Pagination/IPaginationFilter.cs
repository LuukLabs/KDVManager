namespace KDVManager.Shared.Application.Contracts.Pagination;

public interface IPaginationFilter
{
    int PageNumber { get; }
    int PageSize { get; }
}
