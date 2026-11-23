var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Msg91Service_1;
import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
let Msg91Service = Msg91Service_1 = class Msg91Service {
    configService;
    logger = new Logger(Msg91Service_1.name);
    lastRequestTime = new Map();
    localOtpStore = new Map();
    constructor(configService) {
        this.configService = configService;
    }
    get authKey() {
        return (this.configService.get('MSG91_AUTH_KEY') ||
            process.env.MSG91_AUTH_KEY ||
            '').trim();
    }
    get templateId() {
        return (this.configService.get('MSG91_TEMPLATE_ID') ||
            process.env.MSG91_TEMPLATE_ID ||
            '').trim();
    }
    get baseUrl() {
        const configured = (this.configService.get('MSG91_BASE_URL') ||
            process.env.MSG91_BASE_URL ||
            'https://control.msg91.com/api/v5/otp').trim().replace(/\/+$/, '');
        if (!configured.includes('/otp')) {
            return `${configured}/api/v5/otp`;
        }
        return configured;
    }
    get sendUrl() {
        return this.baseUrl;
    }
    get verifyUrl() {
        return `${this.baseUrl}/verify`;
    }
    get retryUrl() {
        return `${this.baseUrl}/retry`;
    }
    get isConfigured() {
        const key = this.authKey;
        const tpl = this.templateId;
        return !!(key &&
            tpl &&
            !key.includes('YOUR_MSG91_AUTH_KEY') &&
            !tpl.includes('YOUR_MSG91_TEMPLATE_ID'));
    }
    get isProduction() {
        const nodeEnv = (this.configService.get('NODE_ENV') ||
            process.env.NODE_ENV ||
            'development').trim().toLowerCase();
        return nodeEnv === 'production';
    }
    get isDevelopment() {
        return !this.isProduction;
    }
    get isMockMode() {
        const mockEnv = (this.configService.get('MSG91_MOCK') ||
            process.env.MSG91_MOCK ||
            '').trim().toLowerCase();
        if (mockEnv === 'false' || mockEnv === '0') {
            return false;
        }
        if (mockEnv === 'true' || mockEnv === '1') {
            return true;
        }
        if (!this.isConfigured) {
            return true;
        }
        return false;
    }
    normalizeMobile(rawMobile) {
        const digits = (rawMobile || '').replace(/\D/g, '');
        let clean10 = '';
        if (digits.length === 10) {
            clean10 = digits;
        }
        else if (digits.length === 12 && digits.startsWith('91')) {
            clean10 = digits.slice(2);
        }
        else if (digits.length > 10) {
            clean10 = digits.slice(-10);
        }
        else {
            throw new BadRequestException('Please enter a valid 10-digit mobile number');
        }
        if (!/^[6-9]\d{9}$/.test(clean10)) {
            throw new BadRequestException('Please enter a valid Indian mobile number starting with 6-9');
        }
        return {
            e164: `+91${clean10}`,
            msg91: `91${clean10}`,
            digits10: clean10,
        };
    }
    async sendOtp(rawMobile) {
        const { e164, msg91 } = this.normalizeMobile(rawMobile);
        const now = Date.now();
        if (this.isMockMode) {
            const devOtp = Math.floor(100000 + Math.random() * 900000).toString();
            this.localOtpStore.set(msg91, {
                otp: devOtp,
                expiresAt: now + 10 * 60 * 1000,
                attempts: 0,
            });
            this.lastRequestTime.set(msg91, now);
            this.logger.log(`\n========================================================`);
            this.logger.log(`🧪 [MOCK OTP MODE - NO SMS SENT]`);
            this.logger.log(`📱 Mobile Number     : ${e164} (${msg91})`);
            this.logger.log(`🔑 Fixed Test OTP    : 123456`);
            this.logger.log(`🎲 Generated Dev OTP : ${devOtp}`);
            this.logger.log(`💡 Enter '123456' on your screen to verify immediately.`);
            this.logger.log(`========================================================\n`);
            return {
                success: true,
                message: 'OTP sent successfully (Mock Mode: Use test OTP 123456)',
                mobile: e164,
            };
        }
        const lastTime = this.lastRequestTime.get(msg91);
        if (lastTime && now - lastTime < 30 * 1000) {
            const waitSec = Math.ceil((30 * 1000 - (now - lastTime)) / 1000);
            throw new BadRequestException(`Please wait ${waitSec}s before requesting a new OTP`);
        }
        if (!this.isConfigured) {
            this.logger.error(`MSG91 configuration missing or incomplete`);
            throw new BadRequestException('SMS service configuration error');
        }
        try {
            const queryParams = new URLSearchParams({
                template_id: this.templateId,
                mobile: msg91,
                otp_length: '6',
                otp_expiry: '5',
            });
            const url = `${this.sendUrl}?${queryParams.toString()}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    authkey: this.authKey,
                    'Content-Type': 'application/json',
                },
            });
            const data = (await response.json());
            if (data.type !== 'success') {
                this.logger.error(`MSG91 SendOTP failed for ${msg91}: ${data.message || JSON.stringify(data)}`);
                throw new BadRequestException(data.message || 'Failed to send OTP via SMS provider');
            }
            this.lastRequestTime.set(msg91, now);
            this.logger.log(`📲 [MSG91 REAL SMS DISPATCHED] Mobile: ${e164} | RequestId: ${data.request_id || 'N/A'}`);
            if (this.isDevelopment) {
                this.logger.log(`💡 [Dev Note] If SMS is delayed or MSG91 balance is 0, enter test OTP: 123456`);
            }
            return {
                success: true,
                message: this.isDevelopment
                    ? 'OTP dispatched! (Development Test OTP: 123456)'
                    : 'OTP sent successfully to your mobile number via SMS',
                mobile: e164,
                devOtp: this.isDevelopment ? '123456' : undefined,
            };
        }
        catch (err) {
            if (err instanceof BadRequestException)
                throw err;
            this.logger.error(`Error connecting to MSG91 SendOTP: ${err.message}`);
            throw new BadRequestException('Failed connecting to SMS service. Please try again shortly.');
        }
    }
    async verifyOtp(rawMobile, otp) {
        const { msg91, e164 } = this.normalizeMobile(rawMobile);
        const cleanOtp = (otp || '').trim();
        if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
            throw new BadRequestException('Verification code must contain exactly 6 digits');
        }
        if (this.isMockMode) {
            const entry = this.localOtpStore.get(msg91);
            if (cleanOtp === '123456') {
                this.logger.log(`🧪 [Mock Mode] Accepted fixed test OTP 123456 for ${e164}`);
                if (entry)
                    this.localOtpStore.delete(msg91);
                return true;
            }
            if (entry && entry.otp === cleanOtp && Date.now() <= entry.expiresAt) {
                this.logger.log(`🧪 [Mock Mode] Accepted generated dev OTP ${cleanOtp} for ${e164}`);
                this.localOtpStore.delete(msg91);
                return true;
            }
            this.logger.warn(`🧪 [Mock Mode] Rejected OTP '${cleanOtp}' for ${e164}`);
            throw new UnauthorizedException('Invalid verification code. In mock mode, use test OTP 123456.');
        }
        if (this.isDevelopment && cleanOtp === '123456') {
            this.logger.log(`🧪 [Dev Backup] Accepted test OTP 123456 for ${e164}`);
            return true;
        }
        try {
            const queryParams = new URLSearchParams({
                mobile: msg91,
                otp: cleanOtp,
            });
            const url = `${this.verifyUrl}?${queryParams.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    authkey: this.authKey,
                },
            });
            const data = (await response.json());
            if (data.type !== 'success') {
                this.logger.warn(`MSG91 verification rejected for ${msg91}: ${data.message}`);
                throw new UnauthorizedException(data.message || 'Invalid or expired verification code');
            }
            this.logger.log(`✅ MSG91 live OTP verified successfully for ${e164}`);
            return true;
        }
        catch (err) {
            if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
                throw err;
            }
            this.logger.error(`Error verifying with MSG91: ${err.message}`);
            throw new UnauthorizedException('Verification failed with SMS provider');
        }
    }
    async resendOtp(rawMobile, forceCooldown = false) {
        const { e164, msg91 } = this.normalizeMobile(rawMobile);
        const now = Date.now();
        if (this.isMockMode) {
            return this.sendOtp(rawMobile);
        }
        const lastTime = this.lastRequestTime.get(msg91);
        if (!forceCooldown && lastTime && now - lastTime < 30 * 1000) {
            const waitSec = Math.ceil((30 * 1000 - (now - lastTime)) / 1000);
            throw new BadRequestException(`Please wait ${waitSec}s before resending OTP`);
        }
        try {
            const queryParams = new URLSearchParams({
                mobile: msg91,
                retrytype: 'text',
            });
            const url = `${this.retryUrl}?${queryParams.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    authkey: this.authKey,
                },
            });
            const data = (await response.json());
            if (data.type !== 'success') {
                return this.sendOtp(rawMobile);
            }
            this.lastRequestTime.set(msg91, now);
            this.logger.log(`📲 MSG91 live OTP resent to ${e164}`);
            return {
                success: true,
                message: 'OTP resent successfully to your mobile number via SMS',
                mobile: e164,
            };
        }
        catch {
            return this.sendOtp(rawMobile);
        }
    }
};
Msg91Service = Msg91Service_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], Msg91Service);
export { Msg91Service };
//# sourceMappingURL=msg91.service.js.map