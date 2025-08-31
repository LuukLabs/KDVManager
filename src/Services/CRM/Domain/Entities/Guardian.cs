using System;
using System.Collections.Generic;
using KDVManager.Services.CRM.Domain.Interfaces;
using KDVManager.Shared.Domain.Interfaces;

namespace KDVManager.Services.CRM.Domain.Entities
{
    public class Guardian : IMustHaveTenant, IHasDateOfBirth
    {
        public Guid Id { get; set; }

        public Guid TenantId { get; set; }

        public required string GivenName { get; set; }

        public required string FamilyName { get; set; }

        public DateOnly DateOfBirth { get; set; }

        public string? Email { get; set; }

        private readonly List<PhoneNumber> _phoneNumbers = new();
        public IReadOnlyCollection<PhoneNumber> PhoneNumbers => _phoneNumbers.AsReadOnly();

        // Aggregate behavior methods
        public void UpdateNames(string givenName, string familyName)
        {
            GivenName = givenName;
            FamilyName = familyName;
        }

        // Phone numbers management
        public PhoneNumber AddPhoneNumber(string number, PhoneNumberType type)
        {
            var phone = PhoneNumber.Create(number, type);
            _phoneNumbers.Add(phone);
            return phone;
        }

        public void UpdatePhoneNumber(Guid phoneNumberId, string number, PhoneNumberType type)
        {
            var existing = PhoneNumberById(phoneNumberId);
            existing.UpdateNumber(number, type);
        }

        public void RemovePhoneNumber(Guid phoneNumberId)
        {
            var existing = PhoneNumberById(phoneNumberId);
            _phoneNumbers.Remove(existing);
        }

        private PhoneNumber PhoneNumberById(Guid id)
        {
            foreach (var pn in _phoneNumbers)
            {
                if (pn.Id == id) return pn;
            }
            throw new InvalidOperationException("Phone number not found");
        }

    }
}
