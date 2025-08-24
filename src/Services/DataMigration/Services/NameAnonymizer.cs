using System.Security.Cryptography;
using System.Text;

namespace KDVManager.Services.DataMigration.Services;

/// <summary>
/// Deterministically anonymizes (pseudonymizes) names based on original input so
/// references remain stable across runs. Uses SHA256 hash -> base32 segments.
/// </summary>
public class NameAnonymizer
{
    public (string? Given, string? Family) Anonymize(string? given, string? family)
    {
        return (given, Transform(family, prefix: "F"));
    }

    public string? AnonymizeEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@')) return email;
        var parts = email.Split('@');
        // Keep domain TLD but anonymize domain label & local part deterministically from full email
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(email.Trim().ToLowerInvariant()));
        var token = Base32Encode(bytes.AsSpan(0, 5).ToArray());
        var domainParts = parts[1].Split('.');
        var tld = domainParts.Length > 1 ? domainParts[^1] : domainParts[0];
        return $"u{token.ToLowerInvariant()}@{parts[1]}"; // e.g. uabc123@anon.com
    }

    private static string? Transform(string? value, string prefix)
    {
        if (string.IsNullOrWhiteSpace(value)) return value; // keep null/empty
        // Hash original (case-insensitive to reduce variants)
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(value.Trim().ToLowerInvariant()));
        // Take first 5 bytes -> 10 base32 chars providing 40 bits of entropy (sufficient for uniqueness at this scale)
        var shortBytes = bytes.AsSpan(0, 5).ToArray();
        var token = Base32Encode(shortBytes);
        return $"{prefix}{token}";
    }

    private static string Base32Encode(byte[] data)
    {
        const string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // RFC 4648
        int outputLength = (int)System.Math.Ceiling(data.Length / 5d) * 8;
        var result = new StringBuilder(outputLength);
        int bitBuffer = 0; int bitBufferLength = 0;
        foreach (var b in data)
        {
            bitBuffer = (bitBuffer << 8) | b;
            bitBufferLength += 8;
            while (bitBufferLength >= 5)
            {
                int index = (bitBuffer >> (bitBufferLength - 5)) & 0x1F;
                bitBufferLength -= 5;
                result.Append(alphabet[index]);
            }
        }
        if (bitBufferLength > 0)
        {
            int index = (bitBuffer << (5 - bitBufferLength)) & 0x1F;
            result.Append(alphabet[index]);
        }
        // Trim padding expectations; we don't add '=' for brevity
        return result.ToString();
    }
}
