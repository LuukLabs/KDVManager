namespace KDVManager.Services.TenantManagement.Domain.Enums
{
    /// <summary>A user's role within a tenant.</summary>
    public enum TenantRole
    {
        /// <summary>The user who provisioned the tenant; full control.</summary>
        Owner = 0,

        /// <summary>Administrative access within the tenant.</summary>
        Admin = 1,

        /// <summary>Regular member.</summary>
        Member = 2,
    }
}
