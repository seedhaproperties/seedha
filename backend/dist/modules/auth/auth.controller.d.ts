import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
declare class SendOtpDto {
    identifier?: string;
    phone?: string;
    mobile?: string;
    email?: string;
}
declare class VerifyOtpDto {
    identifier?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    otp: string;
    name?: string;
}
declare class CompleteSignupDto {
    name: string;
    phone: string;
    email?: string;
}
declare class GoogleAuthDto {
    code?: string;
    codeVerifier?: string;
    redirectUri?: string;
    idToken?: string;
    accessToken?: string;
    email?: string;
    name?: string;
    phone?: string;
}
declare class SocialAuthDto {
    email: string;
    name: string;
    phone?: string;
    providerId?: string;
}
declare class RefreshTokenDto {
    refreshToken: string;
}
declare class ForgotPasswordDto {
    email: string;
}
declare class UpdateProfileDto {
    name?: string;
    phone?: string;
    email?: string;
    avatarUrl?: string;
    dob?: string;
    gender?: string;
    userRole?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
    alternatePhone?: string;
    alternateEmail?: string;
    summary?: {
        savedCount?: number;
        activityCount?: number;
        propertiesCount?: number;
        servicesCount?: number;
    };
    settings?: {
        whatsappUpdates?: boolean;
        pushNotifications?: boolean;
        emailUpdates?: boolean;
        smsAlerts?: boolean;
        offersPromotions?: boolean;
        visitReminders?: boolean;
        useLocation?: boolean;
    };
}
declare class UploadAvatarDto {
    avatarUrl?: string;
    imageBase64?: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import("../../common/constants.js").UserRole;
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
            role: import("../../common/constants.js").UserRole;
        };
    }>;
    sendOtp(dto: SendOtpDto): Promise<{
        success: boolean;
        message: string;
        emailSent: boolean;
        isExistingUser: boolean;
        mobile?: undefined;
        devOtp?: undefined;
    } | {
        success: boolean;
        message: string;
        mobile: string;
        isExistingUser: boolean;
        devOtp: any;
        emailSent?: undefined;
    }>;
    resendOtp(dto: SendOtpDto): Promise<{
        success: boolean;
        message: string;
        emailSent: boolean;
        isExistingUser: boolean;
        mobile?: undefined;
        devOtp?: undefined;
    } | {
        success: boolean;
        message: string;
        mobile: string;
        isExistingUser: boolean;
        devOtp: any;
        emailSent?: undefined;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
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
            role: import("../../common/constants.js").UserRole;
        };
    }>;
    completeSignup(dto: CompleteSignupDto): Promise<{
        accessToken: string;
        refreshToken: string;
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import("../../common/constants.js").UserRole;
        };
    }>;
    googleAuth(dto: GoogleAuthDto): Promise<{
        accessToken: string;
        refreshToken: string;
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import("../../common/constants.js").UserRole;
        };
    }>;
    appleAuth(dto: SocialAuthDto): Promise<{
        accessToken: string;
        refreshToken: string;
        success: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import("../../common/constants.js").UserRole;
        };
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        success: boolean;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
        demoOtp?: undefined;
    } | {
        success: boolean;
        message: string;
        demoOtp: string;
    }>;
    getMe(req: any): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        role: import("../../common/constants.js").UserRole;
        avatarUrl: string | null;
        dob: string;
        gender: string;
        userRole: string;
        streetAddress: string;
        city: string;
        state: string;
        pincode: string;
        alternatePhone: string | null;
        alternateEmail: string | null;
        summary: {
            savedCount: any;
            activityCount: any;
            propertiesCount: any;
            servicesCount: any;
        };
        settings: any;
    } | {
        authenticated: boolean;
        user: null;
        message: string;
    }>;
    updateMe(req: any, dto: UpdateProfileDto): Promise<{
        success: boolean;
        message: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import("../../common/constants.js").UserRole;
            avatarUrl: string | null;
            dob: string;
            gender: string;
            userRole: string;
            streetAddress: string;
            city: string;
            state: string;
            pincode: string;
            alternatePhone: string | null;
            alternateEmail: string | null;
            summary: {
                savedCount: any;
                activityCount: any;
                propertiesCount: any;
                servicesCount: any;
            };
            settings: any;
        };
    }>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
        success: boolean;
        message: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import("../../common/constants.js").UserRole;
            avatarUrl: string | null;
            dob: string;
            gender: string;
            userRole: string;
            streetAddress: string;
            city: string;
            state: string;
            pincode: string;
            alternatePhone: string | null;
            alternateEmail: string | null;
            summary: {
                savedCount: any;
                activityCount: any;
                propertiesCount: any;
                servicesCount: any;
            };
            settings: any;
        };
    }>;
    uploadAvatar(req: any, body: UploadAvatarDto): Promise<{
        success: boolean;
        avatarUrl: string;
        publicId: string;
        message: string;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import("../../common/constants.js").UserRole;
            avatarUrl: string | null;
            dob: string;
            gender: string;
            userRole: string;
            streetAddress: string;
            city: string;
            state: string;
            pincode: string;
            alternatePhone: string | null;
            alternateEmail: string | null;
            summary: {
                savedCount: any;
                activityCount: any;
                propertiesCount: any;
                servicesCount: any;
            };
            settings: any;
        };
    }>;
    deleteAvatar(req: any): Promise<{
        success: boolean;
        message: string;
        avatarUrl: null;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import("../../common/constants.js").UserRole;
            avatarUrl: string | null;
            dob: string;
            gender: string;
            userRole: string;
            streetAddress: string;
            city: string;
            state: string;
            pincode: string;
            alternatePhone: string | null;
            alternateEmail: string | null;
            summary: {
                savedCount: any;
                activityCount: any;
                propertiesCount: any;
                servicesCount: any;
            };
            settings: any;
        };
    }>;
}
export {};
