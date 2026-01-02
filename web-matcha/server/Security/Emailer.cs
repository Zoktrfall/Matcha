using MailKit.Net.Smtp;
using MimeKit;

namespace server.Security;

public static class Emailer
{
    public static async Task SendVerificationAsync(IConfiguration cfg, string toEmail, string link)
    {
        var msg = new MimeMessage();
        msg.From.Add(new MailboxAddress(cfg["Smtp:FromName"] ?? "Matcha", cfg["Smtp:FromEmail"] ?? "no-reply@matcha.local"));
        msg.To.Add(MailboxAddress.Parse(toEmail));
        msg.Subject = "Verify your Matcha account";

        msg.Body = new TextPart("plain")
        {
            Text = $"Verify your account:\n{link}\n\nIf you didn't sign up, ignore this email."
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(cfg["Smtp:Host"], int.Parse(cfg["Smtp:Port"] ?? "1025"), false);

        var user = cfg["Smtp:User"];
        if (!string.IsNullOrWhiteSpace(user))
            await client.AuthenticateAsync(user, cfg["Smtp:Pass"]);

        await client.SendAsync(msg);
        await client.DisconnectAsync(true);
    }
}