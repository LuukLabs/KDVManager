﻿using System.Reflection;
using KDVManager.Services.Scheduling.Application.Features.Groups.Commands.AddGroup;
using KDVManager.Services.Scheduling.Application.Features.Groups.Commands.DeleteGroup;
using KDVManager.Services.Scheduling.Application.Features.Groups.Queries.ListGroups;
using KDVManager.Services.Scheduling.Application.Features.TimeSlots.Commands.AddTimeSlot;
using KDVManager.Services.Scheduling.Application.Features.TimeSlots.Queries.ListTimeSlots;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.AddSchedule;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Commands.DeleteSchedule;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetChildSchedules;
using KDVManager.Services.Scheduling.Application.Features.Schedules.Queries.GetSchedulesByDate;
using KDVManager.Services.Scheduling.Application.Features.GroupSummary.Queries.GetGroupSummary;
using KDVManager.Services.Scheduling.Application.Features.Children.Commands.AddChild;
using KDVManager.Services.Scheduling.Application.Features.Children.Commands.DeleteChild;
using KDVManager.Services.Scheduling.Application.Features.Children.Commands.UpdateChild;
using KDVManager.Services.Scheduling.Application.Features.Absences.Commands.AddAbsence;
using KDVManager.Services.Scheduling.Application.Features.Absences.Commands.DeleteAbsence;
using KDVManager.Services.Scheduling.Application.Features.Absences.Queries.GetAbsencesByChildId;
using KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Commands.AddClosurePeriod;
using KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Commands.DeleteClosurePeriod;
using KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Queries.ListClosurePeriods;
using KDVManager.Services.Scheduling.Application.Features.ClosurePeriods.Queries.ListClosurePeriodYears;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register handlers
        services.AddScoped<AddGroupCommandHandler>();
        services.AddScoped<DeleteGroupCommandHandler>();
        services.AddScoped<ListGroupsQueryHandler>();
        services.AddScoped<AddTimeSlotCommandHandler>();
        services.AddScoped<ListTimeSlotsQueryHandler>();
        services.AddScoped<AddScheduleCommandHandler>();
        services.AddScoped<DeleteScheduleCommandHandler>();
        services.AddScoped<GetChildSchedulesQueryHandler>();
        services.AddScoped<GetSchedulesByDateQueryHandler>();
        services.AddScoped<GetGroupSummaryQueryHandler>();
        services.AddScoped<AddChildCommandHandler>();
        services.AddScoped<DeleteChildCommandHandler>();
        services.AddScoped<UpdateChildCommandHandler>();
        services.AddScoped<AddAbsenceCommandHandler>();
        services.AddScoped<GetAbsencesByChildIdQueryHandler>();
        services.AddScoped<DeleteAbsenceCommandHandler>();
        services.AddScoped<AddClosurePeriodCommandHandler>();
        services.AddScoped<DeleteClosurePeriodCommandHandler>();
        services.AddScoped<ListClosurePeriodsQueryHandler>();
        services.AddScoped<ListClosurePeriodYearsQueryHandler>();

        return services;
    }
}
