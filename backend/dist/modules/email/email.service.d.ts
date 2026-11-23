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
    sendOtp(email: string, otp: string): Promise<boolean>;
    sendWelcomeEmail(email: string, name: string): Promise<boolean>;
    sendPasswordReset(email: string, otpOrToken: string): Promise<boolean>;
    private logConsoleEmail;
}
