using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KDVManager.Services.Scheduling.Application.Services;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Application.Contracts.Persistence;
using Moq;
using Xunit;

namespace KDVManager.Services.Scheduling.Tests.Application;

public class CalendarServiceTests
{
    private readonly Mock<IScheduleRepository> _scheduleRepo = new();
    private readonly Mock<IAbsenceRepository> _absenceRepo = new();
    private readonly Mock<IClosurePeriodRepository> _closureRepo = new();
    private readonly Mock<IChildRepository> _childRepo = new();

    private CalendarService CreateService() => new(
        _scheduleRepo.Object,
        _absenceRepo.Object,
        _closureRepo.Object,
        _childRepo.Object);

    [Fact]
    public async Task Returns_Closure_And_Rule_And_Absence()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var childId = Guid.NewGuid();
        var timeSlot = new TimeSlot { Id = Guid.NewGuid(), Name = "Morning", StartTime = new TimeOnly(8,0), EndTime = new TimeOnly(12,0) };
        var rule = new ScheduleRule { Id = Guid.NewGuid(), GroupId = groupId, Day = DayOfWeek.Monday, TimeSlot = timeSlot, TimeSlotId = timeSlot.Id };
        var schedule = new Schedule { Id = Guid.NewGuid(), ChildId = childId, StartDate = new DateOnly(2025,8,1), ScheduleRules = new List<ScheduleRule>{ rule } };

        _scheduleRepo.Setup(r => r.ListByGroupsAndDateRangeAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<DateOnly>(), It.IsAny<DateOnly>()))
            .ReturnsAsync(new List<Schedule>{ schedule });

        _closureRepo.Setup(r => r.ListByDateRangeAsync(It.IsAny<DateOnly>(), It.IsAny<DateOnly>()))
            .ReturnsAsync(new List<ClosurePeriod>{ new ClosurePeriod { Id = Guid.NewGuid(), StartDate = new DateOnly(2025,8,11), EndDate = new DateOnly(2025,8,11), Reason = "Holiday" } });

        _absenceRepo.Setup(r => r.GetByChildIdsAndDateRangeAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<DateOnly>(), It.IsAny<DateOnly>()))
            .ReturnsAsync(new List<Absence>{ new Absence { Id = Guid.NewGuid(), ChildId = childId, StartDate = new DateOnly(2025,8,4), EndDate = new DateOnly(2025,8,4), Reason = "Sick" } });

        var service = CreateService();
        var from = new DateOnly(2025,8,1);
        var to = new DateOnly(2025,8,31);

        // Act
    var events = await service.GetForGroupsAsync(new[]{ groupId }, from, to);

        // Assert
    Assert.Contains(events, e => e.Type == CalendarEventType.Closure);
    Assert.Contains(events, e => e.Type == CalendarEventType.Absence);
    // Because absence overrides the rule on that day, there should be at least one absence event.
    // We still expect some schedule rule events for other Mondays (if any) in month.
    Assert.Contains(events, e => e.Type == CalendarEventType.ScheduleRule);
    }
}
