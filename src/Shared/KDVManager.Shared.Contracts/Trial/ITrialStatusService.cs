using System.Threading;
using System.Threading.Tasks;

namespace KDVManager.Shared.Contracts.Trial;

/// <summary>
/// Resolves the <see cref="TrialStatus"/> for the current tenant. Each service
/// provides its own implementation (the CRM service is the source of truth and
/// creates the trial on first use; other services keep a synced read model).
/// </summary>
public interface ITrialStatusService
{
    Task<TrialStatus> GetTrialStatusAsync(CancellationToken cancellationToken = default);
}
