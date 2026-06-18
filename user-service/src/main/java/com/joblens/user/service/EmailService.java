package com.joblens.user.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.mail.from-name:JobLens}")
    private String fromName;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Reset your JobLens password");

            String html = """
                    <!DOCTYPE html>
                    <html>
                    <body style="margin:0;padding:0;background:#080b12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      <table width="100%%" cellpadding="0" cellspacing="0" style="background:#080b12;padding:40px 0;">
                        <tr><td align="center">
                          <table width="480" cellpadding="0" cellspacing="0"
                                 style="background:#0d1117;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
                            <tr>
                              <td style="height:3px;background:linear-gradient(90deg,transparent,#6366f1,transparent);"></td>
                            </tr>
                            <tr><td style="padding:36px 40px 0;">
                              <p style="margin:0;font-size:22px;font-weight:700;color:#f1f5f9;">Reset your password</p>
                            </td></tr>
                            <tr><td style="padding:16px 40px 0;">
                              <p style="margin:0;font-size:15px;color:#94a3b8;line-height:1.6;">
                                We received a request to reset the password for your JobLens account associated with
                                <strong style="color:#e2e8f0;">%s</strong>.
                              </p>
                            </td></tr>
                            <tr><td style="padding:28px 40px;">
                              <a href="%s"
                                 style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;
                                        font-size:15px;font-weight:600;padding:13px 28px;border-radius:10px;">
                                Reset password
                              </a>
                            </td></tr>
                            <tr><td style="padding:0 40px 24px;">
                              <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
                                This link expires in <strong style="color:#64748b;">1 hour</strong>.
                                If you didn't request a password reset, you can safely ignore this email.
                              </p>
                            </td></tr>
                            <tr>
                              <td style="padding:20px 40px;border-top:1px solid #1e293b;">
                                <p style="margin:0;font-size:12px;color:#334155;">
                                  &copy; 2026 JobLens &mdash; AI-powered job matching
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td></tr>
                      </table>
                    </body>
                    </html>
                    """.formatted(toEmail, resetLink);

            String text = "Reset your JobLens password by visiting: " + resetLink +
                    "\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.";

            helper.setText(text, html);
            mailSender.send(message);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}
