using System.Collections.Generic;

namespace KDVManager.Services.ChildManagement.Application.Contracts.Pagination
{
    public class PagedList<T> : List<T>
    {
        public PagedList(List<T> records, int count)
        {
            TotalCount = count;
            AddRange(records);
        }

        public int TotalCount { get; private set; }
    }
}