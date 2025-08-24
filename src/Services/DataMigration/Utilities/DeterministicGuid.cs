using System;
using System.Security.Cryptography;
using System.Text;

namespace KDVManager.Services.DataMigration.Utilities;

/// <summary>
/// Generates deterministic GUIDs (UUID v5 style) based on a namespace GUID and a name value.
/// Implementation uses SHA1 hashing per RFC 4122 section 4.3.
/// </summary>
public static class DeterministicGuid
{
    /// <summary>
    /// Creates a deterministic GUID using SHA1 of namespace + name (UUID v5 style).
    /// </summary>
    /// <param name="namespaceId">Stable namespace identifier (e.g. per tenant).</param>
    /// <param name="name">Stable name (e.g. entityType:legacyId).</param>
    public static Guid Create(Guid namespaceId, string name)
    {
        // Convert namespace UUID to network order (big-endian) per RFC 4122
        var namespaceBytes = namespaceId.ToByteArray();
        SwapByteOrder(namespaceBytes);

        var nameBytes = Encoding.UTF8.GetBytes(name);

        // SHA1 hash namespace + name
        Span<byte> hash = stackalloc byte[20];
        using (var sha1 = SHA1.Create())
        {
            sha1.TransformBlock(namespaceBytes, 0, namespaceBytes.Length, null, 0);
            sha1.TransformFinalBlock(nameBytes, 0, nameBytes.Length);
            sha1.Hash.CopyTo(hash);
        }

        // Build UUID from first 16 bytes of hash
        var newGuid = new byte[16];
        hash[..16].CopyTo(newGuid);

        // Set version (5) and variant bits
        newGuid[6] = (byte)((newGuid[6] & 0x0F) | (5 << 4));
        newGuid[8] = (byte)((newGuid[8] & 0x3F) | 0x80);

        // Convert to little-endian for Guid ctor
        SwapByteOrder(newGuid);
        return new Guid(newGuid);
    }

    private static void SwapByteOrder(Span<byte> guid) // Big-endian <-> little-endian swap for RFC compliance
    {
        // Manual swaps (avoid local function capturing span causing CS9108)
        (guid[0], guid[3]) = (guid[3], guid[0]);
        (guid[1], guid[2]) = (guid[2], guid[1]);
        (guid[4], guid[5]) = (guid[5], guid[4]);
        (guid[6], guid[7]) = (guid[7], guid[6]);
    }
}
