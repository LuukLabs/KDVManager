using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace KDVManager.Services.CRM.Application.Features.Children.Commands.UpdateChild
{
    public class UpdateChildCommand
    {
        [property: Required]
        public Guid Id { get; set; }

        [property: Required]
        public string? GivenName { get; set; }

        [property: Required]
        public string? FamilyName { get; set; }

        [property: Required]
        public DateOnly? DateOfBirth { get; set; }

        public string? Allergies { get; set; }

        public string? Medication { get; set; }

        public string? DietaryRequirements { get; set; }

        public string? MedicalNotes { get; set; }
    }
}
