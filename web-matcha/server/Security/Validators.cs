using System.Text.RegularExpressions;

namespace server.Security;

public static class Validators
{
    public static bool IsValidEmail(string email) => Regex.IsMatch(email.Trim(), @"^[^\s@]+@[^\s@]+\.[^\s@]+$");

    public static string? ValidatePassword(string pw)
    {
        if(pw.Length < 8) 
            return "Password must be at least 8 characters.";
        
        if(!Regex.IsMatch(pw, "[A-Z]")) 
            return "Password must contain at least 1 uppercase letter (A-Z).";
        
        if(!Regex.IsMatch(pw, "[a-z]")) 
            return "Password must contain at least 1 lowercase letter (a-z).";
        
        if(!Regex.IsMatch(pw, "[0-9]"))
            return "Password must contain at least 1 number (0-9).";
        
        if(!Regex.IsMatch(pw, @"[^A-Za-z0-9]")) 
            return "Password must contain at least 1 special character.";
        
        return null;
    }
}