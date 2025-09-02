using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Domain.Events;
using KDVManager.Services.Scheduling.Domain.Workflow;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using KDVManager.Services.Scheduling.Domain.Entities;

namespace KDVManager.Services.Scheduling.Application.Workflow;

public interface IWorkflowEngine
{
    ValueTask PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default);
}

internal sealed class WorkflowEngine : IWorkflowEngine
{
    private readonly IAgeBasedWorkflowRuleRepository _configRepo;
    private readonly IServiceProvider _serviceProvider;

    public WorkflowEngine(IAgeBasedWorkflowRuleRepository configRepo, IServiceProvider serviceProvider)
    {
        _configRepo = configRepo;
        _serviceProvider = serviceProvider;
    }

    public async ValueTask PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default)
    {
        switch (@event)
        {
            case ChildTurnedAgeDomainEvent ageEvent:
                var context = new RuleEvaluationContext(ageEvent.TenantId, ageEvent.BirthdayDate);
                var configs = await _configRepo.GetByTenantAndAgeAsync(ageEvent.TenantId, ageEvent.Age);
                foreach (var cfg in configs)
                {
                    switch (cfg.ActionType)
                    {
                        case WorkflowActionType.AddEndMark:
                            var endMarkSvc = (IWorkflowRule<ChildTurnedAgeDomainEvent>)_serviceProvider.GetService(typeof(IWorkflowRule<ChildTurnedAgeDomainEvent>))!; // placeholder
                            await endMarkSvc.EvaluateAsync(ageEvent, context, cancellationToken);
                            break;
                        case WorkflowActionType.ReassignGroup:
                            var reassignRule = (IWorkflowRule<ChildTurnedAgeDomainEvent>)_serviceProvider.GetService(typeof(IWorkflowRule<ChildTurnedAgeDomainEvent>))!; // to be refined with keyed services
                            await reassignRule.EvaluateAsync(ageEvent, context, cancellationToken);
                            break;
                    }
                }
                break;
        }
    }
}
