import { ConfigService } from '@nestjs/config';
export interface Msg91SendOtpResponse {
    message: string;
    type: 'success' | 'error';
}
export interface Msg91VerifyOtpResponse {
    message: string;
    type: 'success' | 'error';
}
export declare class Msg91Service {
    private readonly configService;
    private readonly logger;
    private lastRequestTime;
    private localOtpStore;
    constructor(configService: ConfigService);
    private get authKey();
    private get templateId();
    private get baseUrl();
    private get sendUrl();
    private get verifyUrl();
    private get retryUrl();
    get isConfigured(): boolean;
    get isProduction(): boolean;
    get isDevelopment(): boolean;
    get isMockMode(): boolean;
    normalizeMobile(rawMobile: string): {
        e164: string;
        msg91: string;
        digits10: string;
    };
    sendOtp(rawMobile: string): Promise<{
        success: boolean;
        message: string;
        mobile: string;
        devOtp?: string;
    }>;
    verifyOtp(rawMobile: string, otp: string): Promise<boolean>;
    resendOtp(rawMobile: string, forceCooldown?: boolean): Promise<{
        success: boolean;
        message: string;
        mobile: string;
        devOtp?: string;
    }>;
}
