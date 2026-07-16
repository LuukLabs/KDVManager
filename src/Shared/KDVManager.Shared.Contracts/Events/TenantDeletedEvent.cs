namespace KDVManager.Shared.Contracts.Events;

/// <summary>
/// Raised by the TenantManagement service when a platform admin deletes a tenant.
/// Like the other tenant lifecycle events, the tenant id travels via the message's
/// TenantId header. Services holding tenant read models consume this to drop the
/// tenant's row; purging the tenant's remaining data is left to future business logic.
/// </summary>
public class TenantDeletedEvent
{
}
