using System.Threading;
using System.Threading.Tasks;

namespace KDVManager.Services.Scheduling.Domain.Workflow;

/// <summary>
/// Marker abstraction for workflow rules that react to events or scheduled scans.
/// </summary>
public interface IWorkflowRule<in TEvent>
{
    ValueTask EvaluateAsync(TEvent @event, IRuleEvaluationContext context, CancellationToken cancellationToken = default);
}
