namespace KDVManager.Services.ChildManagement.Application.Contracts.Queries
{
    public class PaginationQuery
    {
        private int _defaultPageSize = 25;

        public PaginationQuery()
        {
            PageNumber = 1;
            PageSize = _defaultPageSize;
        }

        public int PageNumber { get; set; }

        private int _maxPageSize = 100;
        private int _pageSize = 100;
        public int PageSize
        {
            get { return _pageSize; }
            set
            {
                _pageSize = value > _maxPageSize ? _maxPageSize : value;
            }
        }
    }
}