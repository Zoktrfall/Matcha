namespace server.Models;

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string FirstName, string LastName, string Email, string Password);
public record VerifyEmailRequest(string Token);