import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface SendMailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
export declare class EmailService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private transporter;
    private isConfigured;
    private fromAddress;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initTransporter;
    sendMail(options: SendMailOptions): Promise<{
        success: boolean;
        messageId?: string;
        preview?: boolean;
    }>;
    sendOtp(email: string, otp: string, userName?: string): Promise<boolean>;
    sendWelcomeEmail(email: string, name: string): Promise<boolean>;
    sendPasswordReset(email: string, otpOrToken: string, userName?: string): Promise<boolean>;
    sendPaymentConfirmation(email: string, details: {
        txnId: string;
        amount: number;
        purpose: string;
        customerName?: string;
        date?: string;
        propertyTitle?: string;
    }): Promise<boolean>;
    sendPropertyEnquiry(email: string, details: {
        propertyTitle: string;
        customerName: string;
        customerPhone?: string;
        customerEmail?: string;
        message?: string;
    }): Promise<boolean>;
    sendTestEmail(email: string): Promise<{
        success: boolean;
        messageId?: string;
    }>;
    private logConsoleEmail;
}
