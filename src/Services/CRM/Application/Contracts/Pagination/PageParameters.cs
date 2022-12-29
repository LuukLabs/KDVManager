using KDVManager.Services.CRM.Domain.Interfaces;
using MediatR;

namespace KDVManager.Services.CRM.Application.Contracts.Pagination
{
    public abstract class PageParameters : IPaginationFilter
    {
        const int maxPageSize = 100;
        const int defaultPageSize = 25;

        public PageParameters()
        {
            PageNumber = 1;
            PageSize = defaultPageSize;
        }

        public int PageNumber { get; set; }
        private int _pageSize = defaultPageSize;
        public int PageSize
        {
            get { return _pageSize; }
            set
            {
                _pageSize = (value > maxPageSize) ? maxPageSize : value;
            }
        }
    }
}