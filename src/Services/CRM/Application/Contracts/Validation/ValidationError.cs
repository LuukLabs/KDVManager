namespace KDVManager.Services.CRM.Application.Contracts.Validation
{
    public class ValidationError
    {
        public string Code { get; set; }
        public string Property { get; set; }
        public string Title { get; set; }
    }
}
