namespace server.Models;

public record LoginRequest(string Username, string Password);
public record RegisterRequest(string FirstName, string LastName, string Username, string Email, string Password);
public record VerifyEmailRequest(string Token);
public record ResendVerificationRequest(string Email);
public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Token, string NewPassword);