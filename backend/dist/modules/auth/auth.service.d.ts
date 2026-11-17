import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserRecord } from '../../common/mock-db.js';
import { UserRole } from '../../common/constants.js';
import { EmailService } from '../email/email.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { Msg91Service } from './msg91.service.js';
export declare class AuthService {
    private readonly jwtService;
    private readonly emailService;
    private readonly prisma;
    private readonly msg91Service;
    private readonly logger;
    private otpStore;
    private googleClient;
    constructor(jwtService: JwtService, emailService: EmailService, prisma: PrismaService, msg91Service: Msg91Service);
    findUser(identifier: string): Promise<UserRecord | null>;
    createUser(userData: {
        name: string;
        email: string;
        phone: string;
        passwordHash?: string;
        role?: UserRole;
    }): Promise<UserRecord>;
    private saveRefreshToken;
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: UserRole;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: UserRole;
        };
    }>;
    sendOtp(identifier: string): Promise<{
        success: boolean;
        message: string;
        emailSent: boolean;
        isExistingUser: boolean;
        mobile?: undefined;
    } | {
        success: boolean;
        message: string;
        mobile: string;
        isExistingUser: boolean;
        emailSent?: undefined;
    }>;
    resendOtp(identifier: string): Promise<{
        success: boolean;
        message: string;
        emailSent: boolean;
        isExistingUser: boolean;
        mobile?: undefined;
    } | {
        success: boolean;
        message: string;
        mobile: string;
        isExistingUser: boolean;
        emailSent?: undefined;
    }>;
    verifyOtp(identifier: string, code: string, name?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        success: boolean;
        isNewUser: boolean;
        phone: string;
        mobile: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: UserRole;
        };
    }>;
    completeSignup(dto: {
        name: string;
        phone?: string;
        email?: string;
        role?: UserRole;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: UserRole;
        };
    }>;
    verifyGoogleToken(idToken: string): Promise<{
        email: string;
        name: string;
        googleId: string;
        picture?: string;
    }>;
    exchangeGoogleCode(code: string, codeVerifier: string, redirectUri?: string): Promise<{
        idToken: string;
        accessToken?: string;
    }>;
    googleAuth(dto: {
        code?: string;
        codeVerifier?: string;
        redirectUri?: string;
        idToken?: string;
        accessToken?: string;
        email?: string;
        name?: string;
        phone?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: UserRole;
        };
    }>;
    socialAuth(dto: {
        provider: 'google' | 'apple';
        email: string;
        name: string;
        providerId?: string;
        phone?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: UserRole;
        };
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        success: boolean;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
        demoOtp?: undefined;
    } | {
        success: boolean;
        message: string;
        demoOtp: string;
    }>;
    getCurrentUser(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        role: UserRole;
    }>;
    private generateTokens;
}
