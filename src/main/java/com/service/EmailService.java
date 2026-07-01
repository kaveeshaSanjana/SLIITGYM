package com.service;

import com.entity.Instructor;
import com.entity.Member;
import com.entity.Payment;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * EmailService - Handles sending email notifications for the gym system.
 * Sends HTML-formatted emails for key events:
 *   - Welcome email when a new member registers
 *   - Welcome email when a new instructor is added
 *   - Payment confirmation receipt when a payment is recorded
 *
 * Uses Gmail SMTP (configured in application.properties).
 * All emails are sent asynchronously so API responses are not delayed.
 * If email sending fails, the error is logged but does NOT block the main operation.
 */
@Service
public class EmailService {


     private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }


    /** Sender email address (from application.properties) */
    @Value("${spring.mail.username}")
    private String fromEmail;

    /** Display name for the sender (from application.properties) */
    @Value("${app.email.from-name:IronPulse Gym}")
    private String fromName;

    /** Master switch to enable/disable all email sending */
    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;
 // =====================================================================
    //  PUBLIC METHODS - Called by controllers/services to trigger emails
    // =====================================================================

    /**
     * Sends a welcome email to a newly registered gym member.
     * Includes their name, membership type, and plan details.
     *
     * @param member the newly created member
     */
    @Async
    public void sendMemberWelcomeEmail(Member member) {
        if (!emailEnabled || member.getEmail() == null) return;

        String subject = "Welcome to IronPulse Gym, " + member.getName() + "!";
        String htmlBody = buildMemberWelcomeHtml(member);

        sendHtmlEmail(member.getEmail(), subject, htmlBody);
    }

    /**
     * Sends a welcome/onboarding email to a newly added instructor.
     * Includes their name, specialization, and working hours.
     *
     * @param instructor the newly created instructor
     */
    @Async
    public void sendInstructorWelcomeEmail(Instructor instructor) {
        if (!emailEnabled || instructor.getEmail() == null) return;

        String subject = "Welcome to IronPulse Gym Team, " + instructor.getName() + "!";
        String htmlBody = buildInstructorWelcomeHtml(instructor);

        sendHtmlEmail(instructor.getEmail(), subject, htmlBody);
    }

    /**
     * Sends a payment confirmation/receipt email to a member.
     * Includes payment amount, date, method, status, and plan name.
     *
     * @param payment the payment that was just recorded
     */
    @Async
    public void sendPaymentConfirmationEmail(Payment payment) {
        if (!emailEnabled || payment.getMember() == null || payment.getMember().getEmail() == null) return;

        String memberEmail = payment.getMember().getEmail();
        String memberName = payment.getMember().getName();
        String subject = "Payment Confirmation - IronPulse Gym";
        String htmlBody = buildPaymentConfirmationHtml(payment, memberName);

        sendHtmlEmail(memberEmail, subject, htmlBody);
    }

    /**
     * Sends a custom email with a given subject and HTML body.
     * Useful for admin-triggered emails or custom notifications.
     *
     * @param toEmail   recipient's email address
     * @param subject   email subject line
     * @param htmlBody  HTML content of the email body
     */
    @Async
    public void sendCustomEmail(String toEmail, String subject, String htmlBody) {
        if (!emailEnabled) return;
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    // =====================================================================
    //  PRIVATE HELPER - Sends the actual email via SMTP
    // =====================================================================

    /**
     * Sends an HTML email using JavaMailSender.
     * If sending fails, the error is logged but the exception is NOT propagated
     * so the calling business operation is not affected.
     *
     * @param toEmail  recipient's email address
     * @param subject  email subject line
     * @param htmlBody HTML content of the email
     */
    private void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML content

            mailSender.send(message);
            log.info("Email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}: {}", toEmail, e.getMessage());
        }
    }

    // =====================================================================
    //  HTML EMAIL TEMPLATES
    // =====================================================================

    /**
     * Builds the HTML body for a member welcome email.
     * Styled with IronPulse Gym branding colors (dark theme with orange accents).
     */
    private String buildMemberWelcomeHtml(Member member) {
        String planName = (member.getPlan() != null) ? member.getPlan().getName() : "Not assigned yet";
        String membershipType = (member.getMembershipType() != null) ? member.getMembershipType().name() : "N/A";
        String instructorName = (member.getInstructor() != null) ? member.getInstructor().getName() : "Not assigned yet";

        return """
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #1a1a2e; color: #ffffff; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #16213e; border-radius: 10px; padding: 30px;">
                    <h1 style="color: #e94560; text-align: center;">Welcome to IronPulse Gym!</h1>
                    <p style="font-size: 16px;">Hi <strong>%s</strong>,</p>
                    <p>We're thrilled to have you as a member of our gym family! Here are your membership details:</p>
                    <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Membership Type</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Plan</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Assigned Instructor</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Member Since</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">%s</td>
                        </tr>
                    </table>
                    <p>Get started by visiting us and checking into the gym. Stay fit and healthy!</p>
                    <p style="color: #e94560; font-weight: bold;">- The IronPulse Gym Team</p>
                </div>
            </body>
            </html>
            """.formatted(
                member.getName(),
                membershipType,
                planName,
                instructorName,
                member.getJoinedDate() != null ? member.getJoinedDate() : "Today"
        );
    }

    /**
     * Builds the HTML body for an instructor welcome/onboarding email.
     */
    private String buildInstructorWelcomeHtml(Instructor instructor) {
        return """
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #1a1a2e; color: #ffffff; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #16213e; border-radius: 10px; padding: 30px;">
                    <h1 style="color: #e94560; text-align: center;">Welcome to the IronPulse Team!</h1>
                    <p style="font-size: 16px;">Hi <strong>%s</strong>,</p>
                    <p>We're excited to have you join our instructor team! Here are your details:</p>
                    <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Specialization</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Experience</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Working Hours</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">%s</td>
                        </tr>
                    </table>
                    <p>We look forward to working with you. Let's inspire our members together!</p>
                    <p style="color: #e94560; font-weight: bold;">- The IronPulse Gym Team</p>
                </div>
            </body>
            </html>
            """.formatted(
                instructor.getName(),
                instructor.getSpecialization() != null ? instructor.getSpecialization() : "N/A",
                instructor.getExperience() != null ? instructor.getExperience() : "N/A",
                instructor.getWorkingHours() != null ? instructor.getWorkingHours() : "Not set yet"
        );
    }

    /**
     * Builds the HTML body for a payment confirmation/receipt email.
     */
    private String buildPaymentConfirmationHtml(Payment payment, String memberName) {
        return """
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #1a1a2e; color: #ffffff; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #16213e; border-radius: 10px; padding: 30px;">
                    <h1 style="color: #e94560; text-align: center;">Payment Confirmation</h1>
                    <p style="font-size: 16px;">Hi <strong>%s</strong>,</p>
                    <p>Here is your payment receipt from IronPulse Gym:</p>
                    <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Payment ID</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Amount</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold; color: #4caf50;">$%.2f</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Date</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Plan</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Payment Method</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Status</td>
                            <td style="padding: 10px; border-bottom: 1px solid #333; font-weight: bold; color: %s;">%s</td>
                        </tr>
                    </table>
                    <p>Thank you for your payment. Keep up the great work at the gym!</p>
                    <p style="color: #e94560; font-weight: bold;">- The IronPulse Gym Team</p>
                </div>
            </body>
            </html>
            """.formatted(
                memberName,
                payment.getId(),
                payment.getAmount(),
                payment.getDate(),
                payment.getPlanName(),
                payment.getMethod() != null ? payment.getMethod().name() : "N/A",
                payment.getStatus() != null && payment.getStatus().name().equals("PAID") ? "#4caf50" : "#ff9800",
                payment.getStatus() != null ? payment.getStatus().name() : "N/A"
        );
    }

}
