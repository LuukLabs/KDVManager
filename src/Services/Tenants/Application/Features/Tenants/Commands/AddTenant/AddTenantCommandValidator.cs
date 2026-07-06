using FluentValidation;

namespace KDVManager.Services.Tenants.Application.Features.Tenants.Commands.AddTenant;

public class AddTenantCommandValidator : AbstractValidator<AddTenantCommand>
{
    public AddTenantCommandValidator()
    {
        RuleFor(p => p.Name)
            .NotEmpty()
            .NotNull()
            .MaximumLength(200);
    }
}
