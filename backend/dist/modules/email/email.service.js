var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new Logger(EmailService_1.name);
    transporter = null;
    isConfigured = false;
    fromAddress = 'Seedha Properties <noreply@seedhaproperties.com>';
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        this.initTransporter();
    }
    initTransporter() {
        const host = this.configService.get('SMTP_HOST') || process.env.SMTP_HOST;
        const port = parseInt(this.configService.get('SMTP_PORT') || process.env.SMTP_PORT || '587', 10);
        const secure = (this.configService.get('SMTP_SECURE') || process.env.SMTP_SECURE) === 'true' ||
            port === 465;
        const user = this.configService.get('SMTP_USER') || process.env.SMTP_USER;
        const pass = this.configService.get('SMTP_PASS') || process.env.SMTP_PASS;
        const from = this.configService.get('SMTP_FROM') || process.env.SMTP_FROM;
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
                });
                this.isConfigured = true;
                this.logger.log(`📧 SMTP Transporter initialized using ${host}:${port} (user: ${user})`);
                this.transporter.verify((error) => {
                    if (error) {
                        this.logger.warn(`⚠️ SMTP Verification failed (${error.message}). Will log emails to console fallback.`);
                    }
                    else {
                        this.logger.log(`✅ SMTP Server connection verified and ready to send emails.`);
                    }
                });
            }
            catch (err) {
                this.isConfigured = false;
                this.logger.warn(`Failed initializing SMTP transporter: ${err.message}. Using console fallback.`);
            }
        }
        else {
            this.isConfigured = false;
            this.logger.log('ℹ️ SMTP credentials not fully provided (SMTP_HOST, SMTP_USER, SMTP_PASS). Operating in simulation mode (emails logged to console).');
        }
    }
    async sendMail(options) {
        const { to, subject, text, html } = options;
        if (this.isConfigured && this.transporter) {
            try {
                const info = await this.transporter.sendMail({
                    from: this.fromAddress,
                    to,
                    subject,
                    text: text || html?.replace(/<[^>]*>?/gm, ''),
                    html,
                });
                this.logger.log(`📤 Email sent to ${to} (Message ID: ${info.messageId})`);
                return { success: true, messageId: info.messageId };
            }
            catch (err) {
                this.logger.error(`❌ Failed to send email via SMTP to ${to}: ${err.message}`);
                this.logConsoleEmail(to, subject, text || html || '');
                return { success: false, preview: true };
            }
        }
        else {
            this.logConsoleEmail(to, subject, text || html || '');
            return { success: true, preview: true };
        }
    }
    async sendOtp(email, otp) {
        const subject = `Your Seedha Properties Verification Code: ${otp}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0F172A; margin: 0;">Seedha Properties</h2>
          <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Direct Owners • Zero Brokerage • Transparent Real Estate</p>
        </div>
        <div style="padding: 24px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
          <p style="color: #334155; font-size: 16px; margin-bottom: 12px;">Your one-time authentication code is:</p>
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
    async sendWelcomeEmail(email, name) {
        const subject = `Welcome to Seedha Properties, ${name}!`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0F172A;">Welcome to Seedha Properties</h2>
        <p>Hi ${name},</p>
        <p>Thank you for creating an account with Seedha Properties. You can now discover direct owner properties, schedule verified site visits, manage rental agreements, and access transparent property services.</p>
        <p>If you have any questions, our support team is always here to assist.</p>
        <p style="margin-top: 24px; color: #64748B;">Warm regards,<br/>The Seedha Properties Team</p>
      </div>
    `;
        const result = await this.sendMail({ to: email, subject, html });
        return result.success;
    }
    async sendPasswordReset(email, otpOrToken) {
        const subject = `Reset Your Seedha Properties Password`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0F172A;">Password Reset Request</h2>
        <p>We received a request to reset the password for your account associated with <b>${email}</b>.</p>
        <p>Use the following verification code to proceed:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #B45309; margin: 16px 0;">
          ${otpOrToken}
        </div>
        <p style="color: #64748B; font-size: 13px;">If you did not make this request, you can safely ignore this email.</p>
      </div>
    `;
        const result = await this.sendMail({ to: email, subject, html });
        return result.success;
    }
    logConsoleEmail(to, subject, content) {
        this.logger.log(`\n================== [SMTP CONSOLE PREVIEW] ==================`);
        this.logger.log(`To: ${to}`);
        this.logger.log(`Subject: ${subject}`);
        this.logger.log(`Content: ${content.slice(0, 300)}...`);
        this.logger.log(`============================================================\n`);
    }
};
EmailService = EmailService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], EmailService);
export { EmailService };
//# sourceMappingURL=email.service.js.map