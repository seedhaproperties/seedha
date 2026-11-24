import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private isConfigured = false;
  private fromAddress = 'Seedha Properties <noreply@seedhaproperties.com>';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('SMTP_HOST') || process.env.SMTP_HOST;
    const port = parseInt(
      this.configService.get<string>('SMTP_PORT') || process.env.SMTP_PORT || '587',
      10,
    );
    const secure =
      (this.configService.get<string>('SMTP_SECURE') || process.env.SMTP_SECURE) === 'true' ||
      port === 465;
    const user = this.configService.get<string>('SMTP_USER') || process.env.SMTP_USER;
    const pass = this.configService.get<string>('SMTP_PASS') || process.env.SMTP_PASS;
    const from = this.configService.get<string>('SMTP_FROM') || process.env.SMTP_FROM;

    if (from) {
      this.fromAddress = from;
    }

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 7000,
        });
        this.isConfigured = true;
        this.logger.log(`📧 SMTP Transporter initialized using ${host}:${port} (user: ${user})`);
        
        // Verify connection in the background
        this.transporter.verify((error: any) => {
          if (error) {
            this.logger.warn(`⚠️ SMTP Verification failed (${error.message}). Will log emails to console fallback.`);
          } else {
            this.logger.log(`✅ SMTP Server connection verified and ready to send emails.`);
          }
        });
      } catch (err: any) {
        this.isConfigured = false;
        this.logger.warn(`Failed initializing SMTP transporter: ${err.message}. Using console fallback.`);
      }
    } else {
      this.isConfigured = false;
      this.logger.log(
        'ℹ️ SMTP credentials not fully provided (SMTP_HOST, SMTP_USER, SMTP_PASS). Operating in simulation mode (emails logged to console).',
      );
    }
  }

  async sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; preview?: boolean }> {
    const { to, subject, text, html } = options;

    if (this.isConfigured && this.transporter) {
      try {
        const info: any = await Promise.race([
          this.transporter.sendMail({
            from: this.fromAddress,
            to,
            subject,
            text: text || html?.replace(/<[^>]*>?/gm, ''),
            html,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SMTP dispatch timed out after 6 seconds')), 6000),
          ),
        ]);
        this.logger.log(`📤 Email sent to ${to} (Message ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
      } catch (err: any) {
        this.logger.error(`❌ Failed to send email via SMTP to ${to}: ${err.message}`);
        // Fallback to console
        this.logConsoleEmail(to, subject, text || html || '');
        return { success: false, preview: true };
      }
    } else {
      this.logConsoleEmail(to, subject, text || html || '');
      return { success: true, preview: true };
    }
  }

  async sendOtp(email: string, otp: string, userName?: string): Promise<boolean> {
    const subject = `Your Seedha Properties Verification Code: ${otp}`;
    const greeting = userName ? `Hi ${userName},` : 'Hello,';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0F172A; margin: 0;">Seedha Properties</h2>
          <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Direct Owners • Zero Brokerage • Transparent Real Estate</p>
        </div>
        <div style="padding: 24px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
          <p style="color: #334155; font-size: 16px; margin-bottom: 8px;">${greeting}</p>
          <p style="color: #334155; font-size: 15px; margin-bottom: 12px;">Your one-time authentication code is:</p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1E3A8A; padding: 12px 24px; background: #ffffff; display: inline-block; border-radius: 8px; border: 1px dashed #cbd5e1;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
        </div>
        <p style="color: #64748B; font-size: 12px; text-align: center; margin-top: 24px;">
          If you did not request this verification code, please ignore this email or contact support.
        </p>
      </div>
    `;
    const result = await this.sendMail({ to: email, subject, html });
    return result.success;
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const subject = `Welcome to Seedha Properties, ${name}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0F172A; margin: 0;">Seedha Properties</h2>
          <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Direct Owners • Zero Brokerage</p>
        </div>
        <div style="padding: 20px; color: #334155; line-height: 1.6;">
          <h3 style="color: #0F172A;">Welcome to Seedha Properties!</h3>
          <p>Hi ${name},</p>
          <p>Thank you for creating an account with Seedha Properties. You can now discover direct owner properties, schedule verified site visits, manage rental agreements, and access transparent property services.</p>
          <p>If you have any questions, our support team is always here to assist.</p>
          <p style="margin-top: 24px; color: #64748B;">Warm regards,<br/>The Seedha Properties Team</p>
        </div>
      </div>
    `;
    const result = await this.sendMail({ to: email, subject, html });
    return result.success;
  }

  async sendPasswordReset(email: string, otpOrToken: string, userName?: string): Promise<boolean> {
    const subject = `Reset Your Seedha Properties Password`;
    const greeting = userName ? `Hi ${userName},` : 'Hello,';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0F172A; margin: 0;">Seedha Properties</h2>
          <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Account Security</p>
        </div>
        <div style="padding: 20px; color: #334155; line-height: 1.6;">
          <h3 style="color: #0F172A;">Password Reset Request</h3>
          <p>${greeting}</p>
          <p>We received a request to reset the password for your account associated with <b>${email}</b>.</p>
          <p>Use the following verification code to reset your password:</p>
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #1E3A8A; padding: 12px 24px; background: #f8fafc; display: inline-block; border-radius: 8px; border: 1px dashed #cbd5e1;">
              ${otpOrToken}
            </div>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">This code expires in 15 minutes. If you did not make this request, you can safely ignore this email.</p>
        </div>
      </div>
    `;
    const result = await this.sendMail({ to: email, subject, html });
    return result.success;
  }

  async sendPaymentConfirmation(
    email: string,
    details: {
      txnId: string;
      amount: number;
      purpose: string;
      customerName?: string;
      date?: string;
      propertyTitle?: string;
    },
  ): Promise<boolean> {
    const subject = `Payment Confirmation - ₹${details.amount} | Seedha Properties`;
    const customer = details.customerName || 'Valued Customer';
    const dateStr = details.date || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
          <h2 style="color: #0F172A; margin: 0;">Seedha Properties</h2>
          <p style="color: #16A34A; font-weight: 600; font-size: 15px; margin-top: 6px;">✓ Payment Received Successfully</p>
        </div>
        <div style="padding: 10px 0; color: #334155; line-height: 1.6;">
          <p>Dear ${customer},</p>
          <p>We have successfully received your payment. Here are your transaction details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748B;">Transaction ID</td>
              <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #0F172A;">${details.txnId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748B;">Amount Paid</td>
              <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #16A34A; font-size: 16px;">₹${details.amount.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748B;">Purpose</td>
              <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #0F172A;">${details.purpose}</td>
            </tr>
            ${
              details.propertyTitle
                ? `<tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748B;">Property</td>
                    <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #0F172A;">${details.propertyTitle}</td>
                  </tr>`
                : ''
            }
            <tr>
              <td style="padding: 10px 0; color: #64748B;">Date & Time</td>
              <td style="padding: 10px 0; text-align: right; color: #64748B;">${dateStr}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; font-size: 13px; color: #64748B;">
            A formal receipt is available under your account transaction history. If you need any assistance, feel free to reply to this email.
          </p>
          <p style="margin-top: 24px; color: #64748B;">Warm regards,<br/>The Seedha Properties Team</p>
        </div>
      </div>
    `;

    const result = await this.sendMail({ to: email, subject, html });
    return result.success;
  }

  async sendPropertyEnquiry(
    email: string,
    details: {
      propertyTitle: string;
      customerName: string;
      customerPhone?: string;
      customerEmail?: string;
      message?: string;
    },
  ): Promise<boolean> {
    const subject = `New Property Enquiry: ${details.propertyTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
          <h2 style="color: #0F172A; margin: 0;">Seedha Properties</h2>
          <p style="color: #1E3A8A; font-weight: 600; font-size: 14px; margin-top: 6px;">New Direct Buyer/Tenant Enquiry</p>
        </div>
        <div style="padding: 10px 0; color: #334155; line-height: 1.6;">
          <p>You have received a new enquiry for your property: <b>${details.propertyTitle}</b></p>
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><b>Name:</b> ${details.customerName}</p>
            ${details.customerPhone ? `<p style="margin: 4px 0;"><b>Phone:</b> ${details.customerPhone}</p>` : ''}
            ${details.customerEmail ? `<p style="margin: 4px 0;"><b>Email:</b> ${details.customerEmail}</p>` : ''}
            ${details.message ? `<p style="margin: 8px 0 0 0; color: #1e293b;"><b>Message:</b> "${details.message}"</p>` : ''}
          </div>
          <p style="font-size: 13px; color: #64748B;">
            You can respond directly through Seedha Properties chat or by reaching out using the contact information above.
          </p>
          <p style="margin-top: 24px; color: #64748B;">Best regards,<br/>Seedha Properties Support</p>
        </div>
      </div>
    `;

    const result = await this.sendMail({ to: email, subject, html });
    return result.success;
  }

  async sendTestEmail(email: string): Promise<{ success: boolean; messageId?: string }> {
    const subject = `Seedha Properties - Test Email Verification`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0F172A; margin: 0;">Seedha Properties</h2>
          <p style="color: #16A34A; font-weight: 600; font-size: 14px; margin-top: 4px;">✓ Gmail SMTP Successfully Configured!</p>
        </div>
        <div style="padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534; font-size: 14px;">
          This is an official verification email from <b>Seedha Properties</b>. Your Gmail SMTP integration is fully configured and delivering live messages properly.
        </div>
        <p style="color: #64748B; font-size: 12px; margin-top: 24px; text-align: center;">
          Sent by Seedha Properties Backend • ${new Date().toISOString()}
        </p>
      </div>
    `;

    return this.sendMail({ to: email, subject, html });
  }

  private logConsoleEmail(to: string, subject: string, content: string) {
    this.logger.log(`\n================== [SMTP CONSOLE PREVIEW] ==================`);
    this.logger.log(`To: ${to}`);
    this.logger.log(`Subject: ${subject}`);
    this.logger.log(`Content: ${content.slice(0, 300)}...`);
    this.logger.log(`============================================================\n`);
  }
}

