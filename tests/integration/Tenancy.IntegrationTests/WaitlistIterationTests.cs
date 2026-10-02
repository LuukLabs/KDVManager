using KDVManager.Services.CRM.Application.Exceptions;
using KDVManager.Services.CRM.Application.Features.Waitlist;
using KDVManager.Services.CRM.Domain.Entities;
using KDVManager.Services.CRM.Infrastructure;
using KDVManager.Services.CRM.Infrastructure.Repositories;
using KDVManager.Shared.Contracts.Enums;
using KDVManager.Shared.Infrastructure.Tenancy;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace KDVManager.IntegrationTests.Tenancy;

public class WaitlistIterationTests : IDisposable
{
    private readonly SqliteConnection connection = new("DataSource=:memory:");
    private static readonly Guid TenantA = Guid.NewGuid();
    private static readonly Guid TenantB = Guid.NewGuid();

    // SQLite cannot sort DateTimeOffset natively. Production uses PostgreSQL timestamptz.
    private class TestContext(DbContextOptions<ApplicationDbContext> options, TenancyContextAccessor accessor)
        : ApplicationDbContext(options, accessor)
    {
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<WaitlistEntry>().Property(entry => entry.RegisteredAt)
                .HasConversion(value => value.UtcDateTime, value => new DateTimeOffset(DateTime.SpecifyKind(value, DateTimeKind.Utc)));
        }
    }

    public WaitlistIterationTests()
    {
        connection.Open();
        using var context = Context(TenantA);
        context.Database.EnsureCreated();
    }

    private ApplicationDbContext Context(Guid tenant) => new TestContext(
        new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite(connection).Options,
        new TenancyContextAccessor { Current = new StaticTenancyContext(tenant) });

    public void Dispose() => connection.Dispose();

    private static CreateWaitlistEntryCommand Request(int priority = 0, string? location = "North", DateOnly? start = null) => new()
    {
        GivenName = "Jane", FamilyName = "Doe", DateOfBirth = new(2025, 1, 1),
        DesiredStartDate = start ?? new(2027, 1, 15), ContactName = "Parent", ContactEmail = "parent@example.test",
        Location = location, CareType = ChildcareType.Daycare, PreferredGroup = "Babies", Weekdays = [1, 4],
        StartTime = new(8, 0), EndTime = new(17, 0), Priority = priority,
        PriorityReason = priority > 0 ? "Sibling" : null, PriorityExplanation = priority > 0 ? "Sibling attends North" : null
    };

    private async Task<Guid> Add(int priority = 0, string? location = "North", DateOnly? start = null)
    {
        using var context = Context(TenantA);
        return await new CreateWaitlistEntryCommandHandler(new WaitlistEntryRepository(context)).Handle(Request(priority, location, start));
    }

    [Fact]
    public async Task StructuredPreferencesRoundTripAndTenantCannotReadOrUpdate()
    {
        var id = await Add(10);
        using var contextA = Context(TenantA);
        var entry = await new GetWaitlistEntryQueryHandler(new WaitlistEntryRepository(contextA)).Handle(id);
        Assert.Equal([1, 4], entry.Weekdays);
        Assert.Equal(new TimeOnly(8, 0), entry.StartTime);
        Assert.Equal("Sibling", entry.PriorityReason);
        Assert.Equal("Babies", entry.PreferredGroup);
        using var contextB = Context(TenantB);
        var repositoryB = new WaitlistEntryRepository(contextB);
        Assert.Empty(await repositoryB.ListAsync(true));
        Assert.Null(await repositoryB.GetByIdAsync(id));
        await Assert.ThrowsAsync<NotFoundException>(() => new UpdateWaitlistEntryStatusCommandHandler(repositoryB)
            .Handle(id, new() { Status = WaitlistEntryStatus.Offered, Revision = entry.Revision }, "planner"));
    }

    [Fact]
    public async Task StatusHistoryIsAtomicAttributedAndTenantScoped()
    {
        var id = await Add();
        using (var context = Context(TenantA))
        {
            var repository = new WaitlistEntryRepository(context);
            var entry = await repository.GetByIdAsync(id);
            var handler = new UpdateWaitlistEntryStatusCommandHandler(repository);
            await handler.Handle(id, new() { Status = WaitlistEntryStatus.Offered, Revision = entry.Revision }, "auth0|planner");
            await handler.Handle(id, new() { Status = WaitlistEntryStatus.Offered, Revision = entry.Revision }, "auth0|planner");
        }
        using (var context = Context(TenantA))
        {
            var entry = await new WaitlistEntryRepository(context).GetByIdAsync(id);
            Assert.Equal(WaitlistEntryStatus.Offered, entry.Status);
            var history = Assert.Single(entry.StatusHistory);
            Assert.Equal(WaitlistEntryStatus.Waiting, history.PreviousStatus);
            Assert.Equal("auth0|planner", history.ChangedBy);
            Assert.Equal(TenantA, history.TenantId);
            Assert.True(history.ChangedAt <= DateTimeOffset.UtcNow);
        }
        using var contextB = Context(TenantB);
        Assert.Empty(await contextB.WaitlistStatusChanges.ToListAsync());
    }

    [Fact]
    public async Task ListFiltersStartMonthLocationStatusAndExplainsDeterministicOrdering()
    {
        var normal = await Add();
        var priority = await Add(20);
        var offered = await Add();
        await Add(90, "South");
        await Add(100, start: new(2027, 2, 1));
        using var context = Context(TenantA);
        var repository = new WaitlistEntryRepository(context);
        var offer = await repository.GetByIdAsync(offered);
        await new UpdateWaitlistEntryStatusCommandHandler(repository).Handle(offered,
            new() { Status = WaitlistEntryStatus.Offered, Revision = offer.Revision }, "planner");
        var results = await repository.ListAsync(false, "north", new(2027, 1, 1));
        Assert.Equal(new[] { offered, priority, normal }, results.Select(entry => entry.Id));
        Assert.Single(await repository.ListAsync(false, "North", new(2027, 1, 1), WaitlistEntryStatus.Offered));
        await new UpdateWaitlistEntryStatusCommandHandler(repository).Handle(offered,
            new() { Status = WaitlistEntryStatus.Placed, Revision = offer.Revision }, "planner");
        Assert.DoesNotContain(await repository.ListAsync(false), entry => entry.Id == offered);
        Assert.Single(await repository.ListAsync(false, status: WaitlistEntryStatus.Placed));
    }

    [Fact]
    public async Task InvalidPreferencesAndStatusesAreRejected()
    {
        var validator = new CreateWaitlistEntryCommandValidator();
        Assert.True((await validator.ValidateAsync(Request())).IsValid);
        var invalid = new CreateWaitlistEntryCommand
        {
            GivenName = "Jane", FamilyName = "Doe", DateOfBirth = new(2027, 2, 1), DesiredStartDate = new(2027, 1, 1),
            ContactName = "Parent", ContactEmail = "parent@example.test", Weekdays = [1, 1, 7], Priority = 10,
            CareType = (ChildcareType)999, StartTime = new(17, 0), EndTime = new(8, 0)
        };
        var validation = await validator.ValidateAsync(invalid);
        Assert.Contains(validation.Errors, error => error.PropertyName == "PriorityReason");
        Assert.Contains(validation.Errors, error => error.PropertyName == "PriorityExplanation");
        Assert.Contains(validation.Errors, error => error.PropertyName == "EndTime");
        Assert.Contains(validation.Errors, error => error.PropertyName == "CareType");
        Assert.Contains(validation.Errors, error => error.PropertyName == "DesiredStartDate");
        var id = await Add();
        using var context = Context(TenantA);
        var repository = new WaitlistEntryRepository(context);
        var entry = await repository.GetByIdAsync(id);
        await Assert.ThrowsAsync<ValidationException>(() => new UpdateWaitlistEntryStatusCommandHandler(repository)
            .Handle(id, new() { Status = (WaitlistEntryStatus)999, Revision = entry.Revision }, "planner"));
        await Assert.ThrowsAsync<ValidationException>(() => new UpdateWaitlistEntryStatusCommandHandler(repository)
            .Handle(id, new() { Revision = entry.Revision }, "planner"));
        await Assert.ThrowsAsync<ValidationException>(() => new UpdateWaitlistEntryStatusCommandHandler(repository)
            .Handle(id, new() { Status = WaitlistEntryStatus.Offered }, "planner"));
        Assert.Empty(await context.WaitlistStatusChanges.ToListAsync());
    }

    [Fact]
    public async Task ConcurrentStatusChangeCannotOverwriteOrLeaveFalseAuditRecord()
    {
        var id = await Add();
        using var firstContext = Context(TenantA);
        using var staleContext = Context(TenantA);
        var firstRepository = new WaitlistEntryRepository(firstContext);
        var staleRepository = new WaitlistEntryRepository(staleContext);
        var first = await firstRepository.GetByIdAsync(id);
        var stale = await staleRepository.GetByIdAsync(id);
        var revision = first.Revision;
        await new UpdateWaitlistEntryStatusCommandHandler(firstRepository).Handle(id,
            new() { Status = WaitlistEntryStatus.Offered, Revision = revision }, "first");
        await Assert.ThrowsAsync<ConflictException>(() => new UpdateWaitlistEntryStatusCommandHandler(staleRepository).Handle(id,
            new() { Status = WaitlistEntryStatus.Withdrawn, Revision = revision }, "stale"));
        using var context = Context(TenantA);
        var saved = await new WaitlistEntryRepository(context).GetByIdAsync(id);
        Assert.Equal(WaitlistEntryStatus.Offered, saved.Status);
        Assert.Equal("first", Assert.Single(saved.StatusHistory).ChangedBy);
        await Assert.ThrowsAsync<ConflictException>(() => new UpdateWaitlistEntryStatusCommandHandler(new WaitlistEntryRepository(context)).Handle(id,
            new() { Status = WaitlistEntryStatus.Placed, Revision = revision }, "later"));
    }

    [Fact]
    public async Task WeekendPreferencesUseTheSameDayNumbersAsScheduling()
    {
        using var context = Context(TenantA);
        var repository = new WaitlistEntryRepository(context);
        var id = await new CreateWaitlistEntryCommandHandler(repository).Handle(new()
        {
            GivenName = "Jane", FamilyName = "Doe", DateOfBirth = new(2025, 1, 1), DesiredStartDate = new(2027, 1, 1),
            ContactName = "Parent", ContactEmail = "parent@example.test", Weekdays = [6, 0]
        });
        var entry = await new GetWaitlistEntryQueryHandler(repository).Handle(id);
        Assert.Equal(new[] { 0, 6 }, entry.Weekdays);
    }

    [Fact]
    public async Task LegacyEntryCanBeEnrichedWithoutLosingRegistrationOrOriginalPreferences()
    {
        var id = await Add(location: null);
        using var context = Context(TenantA);
        var repository = new WaitlistEntryRepository(context);
        var entry = await repository.GetByIdAsync(id);
        var registered = entry.RegisteredAt;
        await new UpdateWaitlistEntryCommandHandler(repository).Handle(id, new()
        {
            Revision = entry.Revision, GivenName = "Jane", FamilyName = "Doe", DateOfBirth = entry.DateOfBirth,
            DesiredStartDate = entry.DesiredStartDate, ContactName = "Parent", ContactEmail = "parent@example.test",
            RequestedDays = "Monday or Thursday", Weekdays = [1, 4], Location = "North"
        });
        var result = await new GetWaitlistEntryQueryHandler(repository).Handle(id);
        Assert.Equal(registered, result.RegisteredAt);
        Assert.Equal("Monday or Thursday", result.RequestedDays);
        Assert.Equal("North", result.Location);
        Assert.Equal(WaitlistEntryStatus.Waiting, result.Status);
    }
}
