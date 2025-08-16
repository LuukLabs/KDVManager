using System;
using System.Linq;
using System.Text.Json.Serialization;

namespace KDVManager.Services.CRM.Domain.Entities
{
    [JsonConverter(typeof(JsonStringEnumConverter<PhoneNumberType>))]
    public enum PhoneNumberType
    {
        Mobile = 0,
        Home = 1,
        Work = 2,
        Other = 3
    }

    public class PhoneNumber
    {
        public Guid Id { get; private set; }
        public string Number { get; private set; } = string.Empty; // Stored in E.164 format
        public PhoneNumberType Type { get; private set; }

        private PhoneNumber() { }

        private PhoneNumber(string number, PhoneNumberType type)
        {
            Id = Guid.NewGuid();
            Number = NormalizeToE164(number);
            Type = type;
        }

        public static PhoneNumber Create(string number, PhoneNumberType type) => new PhoneNumber(number, type);

        internal void UpdateNumber(string number, PhoneNumberType type)
        {
            Number = NormalizeToE164(number);
            Type = type;
        }

        public static string NormalizeToE164(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                throw new ArgumentException("Phone number cannot be empty");

            var trimmed = raw.Trim();
            var digits = new string(trimmed.TrimStart('+').Where(char.IsDigit).ToArray());
            var result = "+" + digits;

            if (result.Length < 8 || result.Length > 20)
            {
                throw new ArgumentException($"Phone number '{raw}' is not a valid E.164 length");
            }

            return result;
        }
    }
}
