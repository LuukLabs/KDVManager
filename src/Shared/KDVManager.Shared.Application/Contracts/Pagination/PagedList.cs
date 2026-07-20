namespace KDVManager.Shared.Application.Contracts.Pagination;

public class PagedList<T> : List<T>
{
    public PagedList(IEnumerable<T> records, int totalCount)
    {
        TotalCount = totalCount;
        AddRange(records);
    }

    public int TotalCount { get; }
}
