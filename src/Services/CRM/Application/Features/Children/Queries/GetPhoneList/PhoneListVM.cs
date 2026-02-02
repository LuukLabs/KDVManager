using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using KDVManager.Services.CRM.Domain.Entities;

namespace KDVManager.Services.CRM.Application.Features.Children.Queries.GetPhoneList;

/// <summary>
/// View model representing the complete phone list for a year.
/// </summary>
public class PhoneListResponse
{
    /// <summary>
    /// The year this phone list is for.
    /// </summary>
    [Required]
    public int Year { get; set; }

    /// <summary>
    /// The date/time when this list was generated.
    /// </summary>
    [Required]
    public DateTime GeneratedAt { get; set; }

    /// <summary>
    /// List of children with their guardian contact information.
    /// </summary>
    [Required]
    public List<PhoneListChildVM> Children { get; set; } = [];
}

/// <summary>
/// View model for a child in the phone list.
/// </summary>
public class PhoneListChildVM
{
    /// <summary>
    /// The unique identifier of the child.
    /// </summary>
    [Required]
    public Guid Id { get; set; }

    /// <summary>
    /// The child's full name.
    /// </summary>
    [Required]
    public required string FullName { get; set; }

    /// <summary>
    /// The child's date of birth.
    /// </summary>
    [Required]
    public DateOnly DateOfBirth { get; set; }

    /// <summary>
    /// The child's unique number within the tenant.
    /// </summary>
    [Required]
    public int ChildNumber { get; set; }

    /// <summary>
    /// List of guardians with their contact information.
    /// </summary>
    [Required]
    public List<PhoneListGuardianVM> Guardians { get; set; } = [];
}

/// <summary>
/// View model for a guardian in the phone list.
/// </summary>
public class PhoneListGuardianVM
{
    /// <summary>
    /// The unique identifier of the guardian.
    /// </summary>
    [Required]
    public Guid Id { get; set; }

    /// <summary>
    /// The guardian's full name.
    /// </summary>
    [Required]
    public required string FullName { get; set; }

    /// <summary>
    /// The relationship type to the child.
    /// </summary>
    [Required]
    public GuardianRelationshipType RelationshipType { get; set; }

    /// <summary>
    /// Whether this guardian is the primary contact.
    /// </summary>
    [Required]
    public bool IsPrimaryContact { get; set; }

    /// <summary>
    /// Whether this guardian is an emergency contact.
    /// </summary>
    [Required]
    public bool IsEmergencyContact { get; set; }

    /// <summary>
    /// The guardian's email address.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// List of phone numbers for this guardian.
    /// </summary>
    [Required]
    public List<PhoneListPhoneNumberVM> PhoneNumbers { get; set; } = [];
}

/// <summary>
/// View model for a phone number in the phone list.
/// </summary>
public class PhoneListPhoneNumberVM
{
    /// <summary>
    /// The phone number in E.164 format.
    /// </summary>
    [Required]
    public required string Number { get; set; }

    /// <summary>
    /// The type of phone number (Mobile, Home, Work, Other).
    /// </summary>
    [Required]
    public PhoneNumberType Type { get; set; }
}
