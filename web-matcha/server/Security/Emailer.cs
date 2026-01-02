using MailKit.Net.Smtp;
using MimeKit;

namespace server.Security;

public static class Emailer
{
    public static Task SendVerificationAsync(IConfiguration cfg, string toEmail, string link) =>
        SendAsync(
            cfg,
            toEmail,
            subject: "Verify your Matcha account",
            body:
            $"Verify your account:\n{link}\n\n" +
            "If you didn't sign up, ignore this email."
        );

    public static Task SendPasswordResetAsync(IConfiguration cfg, string toEmail, string link) =>
        SendAsync(
            cfg,
            toEmail,
            subject: "Reset your Matcha password",
            body:
            "You requested a password reset.\n\n" +
            $"Reset your password using this link:\n{link}\n\n" +
            "This link expires soon. If you didn’t request this, ignore this email."
        );

    private static async Task SendAsync(IConfiguration cfg, string toEmail, string subject, string body)
    {
        var msg = new MimeMessage();
        msg.From.Add(new MailboxAddress(
            cfg["Smtp:FromName"] ?? "Matcha",
            cfg["Smtp:FromEmail"] ?? "no-reply@matcha.local"
        ));
        msg.To.Add(MailboxAddress.Parse(toEmail));
        msg.Subject = subject;

        msg.Body = new TextPart("plain") { Text = body };

        using var client = new SmtpClient();

        var host = cfg["Smtp:Host"];
        var port = int.Parse(cfg["Smtp:Port"] ?? "1025");
        var user = cfg["Smtp:User"];
        var pass = cfg["Smtp:Pass"];

        await client.ConnectAsync(host, port, useSsl: false);

        if(!string.IsNullOrWhiteSpace(user))
            await client.AuthenticateAsync(user, pass);

        await client.SendAsync(msg);
        await client.DisconnectAsync(true);
    }
}