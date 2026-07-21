using FluentValidation;

namespace KDVManager.Services.PlatformManagement.Application.Features.Tenants.Commands.CreateTenant;

public class CreateTenantCommandValidator : AbstractValidator<CreateTenantCommand>
{
    public CreateTenantCommandValidator()
    {
        RuleFor(p => p.Name)
            .NotEmpty()
            .NotNull()
            .MaximumLength(100);
    }
}
