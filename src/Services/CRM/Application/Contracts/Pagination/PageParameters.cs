using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;
using KDVManager.Services.CRM.Domain.Interfaces;

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

        [property: DefaultValue(1)]
        [property: Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0.")]
        public int PageNumber { get; set; }
        private int _pageSize = defaultPageSize;

        [property: DefaultValue(defaultPageSize)]
        [property: Range(1, maxPageSize, ErrorMessage = "Page size must be between 1 and 100.")]
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