namespace KDVManager.Services.Scheduling.Domain.Interfaces;

public interface IPaginationFilter
{
    int PageNumber { get; }
    int PageSize { get; }
}

