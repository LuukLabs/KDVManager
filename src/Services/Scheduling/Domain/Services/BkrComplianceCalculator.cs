using System;
using System.Collections.Generic;
using System.Linq;
using KDVManager.Services.Scheduling.Domain.Entities;
using KDVManager.Services.Scheduling.Domain.Models;

namespace KDVManager.Services.Scheduling.Domain.Services;

public class BkrComplianceCalculator
{
    private readonly IReadOnlyDictionary<AgeBand, double> _ratioByAgeBand = new Dictionary<AgeBand, double>
    {
        { AgeBand.Infants, 4 },    // 0-1 year -> 1:4
        { AgeBand.Toddlers, 5 },   // 1-2 years -> 1:5
        { AgeBand.Preschoolers, 6 }, // 2-3 years -> 1:6
        { AgeBand.EarlySchool, 8 }, // 3-4 years -> 1:8
    };

    public GroupComplianceSnapshot CalculateSnapshot(
        Guid tenantId,
        Guid groupId,
        DateTime capturedAtUtc,
        IEnumerable<Child> presentChildren,
        int qualifiedStaffCount,
        double warningBufferPercent,
        string? notes = null)
    {
        var presentList = presentChildren.ToList();
        var weightedStaffRequirement = presentList
            .Select(child => 1 / GetRatioForChild(child, capturedAtUtc))
            .Sum();

        var requiredStaff = Math.Ceiling(weightedStaffRequirement * 100) / 100; // keep two decimals prior to evaluation
        if (requiredStaff < 1 && presentList.Any())
        {
            requiredStaff = 1;
        }

        var bufferPercent = CalculateBuffer(qualifiedStaffCount, requiredStaff);
        var status = DetermineStatus(bufferPercent, qualifiedStaffCount, requiredStaff, warningBufferPercent, presentList.Count);

        return new GroupComplianceSnapshot
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            GroupId = groupId,
            CapturedAtUtc = capturedAtUtc,
            PresentChildrenCount = presentList.Count,
            QualifiedStaffCount = qualifiedStaffCount,
            RequiredStaffCount = Math.Round(requiredStaff, 2),
            BufferPercent = bufferPercent,
            Status = status,
            Notes = notes,
        };
    }

    private double CalculateBuffer(int staffCount, double requiredStaff)
    {
        if (requiredStaff <= 0)
        {
            return staffCount > 0 ? 100 : 0;
        }

        if (staffCount < 0)
        {
            return -100;
        }

        return Math.Round(((staffCount - requiredStaff) / requiredStaff) * 100, 2);
    }

    private ComplianceStatus DetermineStatus(double bufferPercent, int staffCount, double requiredStaff, double warningBufferPercent, int presentChildren)
    {
        if (presentChildren == 0)
        {
            return ComplianceStatus.Ok;
        }

        if (staffCount <= 0)
        {
            return ComplianceStatus.Breach;
        }

        if (staffCount < requiredStaff)
        {
            return ComplianceStatus.Breach;
        }

        if (bufferPercent < warningBufferPercent)
        {
            return ComplianceStatus.Warning;
        }

        return ComplianceStatus.Ok;
    }

    private double GetRatioForChild(Child child, DateTime atUtc)
    {
        var ageInMonths = GetAgeInMonths(child.DateOfBirth, atUtc.Date);
        if (ageInMonths < 12)
        {
            return _ratioByAgeBand[AgeBand.Infants];
        }

        if (ageInMonths < 24)
        {
            return _ratioByAgeBand[AgeBand.Toddlers];
        }

        if (ageInMonths < 36)
        {
            return _ratioByAgeBand[AgeBand.Preschoolers];
        }

        return _ratioByAgeBand[AgeBand.EarlySchool];
    }

    private static int GetAgeInMonths(DateOnly dateOfBirth, DateTime referenceDate)
    {
        var dob = dateOfBirth.ToDateTime(TimeOnly.MinValue);
        var months = (referenceDate.Year - dob.Year) * 12 + referenceDate.Month - dob.Month;
        if (referenceDate.Day < dob.Day)
        {
            months--;
        }
        return Math.Max(0, months);
    }

    private enum AgeBand
    {
        Infants,
        Toddlers,
        Preschoolers,
        EarlySchool
    }
}
