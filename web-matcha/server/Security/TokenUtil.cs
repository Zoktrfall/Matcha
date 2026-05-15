using System.Security.Cryptography;
using System.Text;

namespace server.Security;

public static class TokenUtil
{
    public static string GenerateToken(int numBytes = 32)
    {
        var bytes = RandomNumberGenerator.GetBytes(numBytes);
        return Convert.ToBase64String(bytes);
    }

    public static byte[] Sha256(string value)
    {
        var bytes = Encoding.UTF8.GetBytes(value);
        return SHA256.HashData(bytes);
    }
}
