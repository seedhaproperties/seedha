var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Post, Body, Get, Patch, Put, Delete, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsEmail } from 'class-validator';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
class SendOtpDto {
    identifier;
    phone;
    mobile;
    email;
}
__decorate([
    ApiProperty({ example: '+919876543210', description: 'Email address or 10-digit mobile number', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SendOtpDto.prototype, "identifier", void 0);
__decorate([
    ApiProperty({ example: '+919876543210', description: 'Mobile phone number', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SendOtpDto.prototype, "phone", void 0);
__decorate([
    ApiProperty({ example: '9876543210', description: '10-digit Indian mobile number', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SendOtpDto.prototype, "mobile", void 0);
__decorate([
    ApiProperty({ example: 'rahul@example.com', description: 'Email address', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SendOtpDto.prototype, "email", void 0);
class VerifyOtpDto {
    identifier;
    phone;
    mobile;
    email;
    otp;
    name;
}
__decorate([
    ApiProperty({ example: '+919876543210', description: 'Email address or 10-digit mobile number', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "identifier", void 0);
__decorate([
    ApiProperty({ example: '+919876543210', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "phone", void 0);
__decorate([
    ApiProperty({ example: '9876543210', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "mobile", void 0);
__decorate([
    ApiProperty({ example: 'rahul@example.com', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: '123456', description: '6-digit OTP code' }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "otp", void 0);
__decorate([
    ApiProperty({ example: 'Rahul Sharma', required: false, description: 'Optional user full name' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "name", void 0);
class CompleteSignupDto {
    name;
    phone;
    email;
}
__decorate([
    ApiProperty({ example: 'Rahul Sharma' }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], CompleteSignupDto.prototype, "name", void 0);
__decorate([
    ApiProperty({ example: '+919876543210' }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], CompleteSignupDto.prototype, "phone", void 0);
__decorate([
    ApiProperty({ example: 'rahul@example.com', required: false }),
    IsOptional(),
    IsEmail(),
    __metadata("design:type", String)
], CompleteSignupDto.prototype, "email", void 0);
class GoogleAuthDto {
    code;
    codeVerifier;
    redirectUri;
    idToken;
    accessToken;
    email;
    name;
    phone;
}
__decorate([
    ApiProperty({ example: '4/0AVMBs...', required: false, description: 'Google OAuth 2.0 PKCE authorization code' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "code", void 0);
__decorate([
    ApiProperty({ example: 'pkce_code_verifier_string', required: false, description: 'PKCE code verifier for authorization code exchange' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "codeVerifier", void 0);
__decorate([
    ApiProperty({ example: 'https://auth.expo.io', required: false, description: 'OAuth redirect URI used during code authorization' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "redirectUri", void 0);
__decorate([
    ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIs...', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "idToken", void 0);
__decorate([
    ApiProperty({ example: 'ya29.a0AfH6...', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "accessToken", void 0);
__decorate([
    ApiProperty({ example: 'rahul@gmail.com', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'Rahul Sharma', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "name", void 0);
__decorate([
    ApiProperty({ example: '+919876543210', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], GoogleAuthDto.prototype, "phone", void 0);
class SocialAuthDto {
    email;
    name;
    phone;
    providerId;
}
__decorate([
    ApiProperty({ example: 'rahul@gmail.com' }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], SocialAuthDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'Rahul Sharma' }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], SocialAuthDto.prototype, "name", void 0);
__decorate([
    ApiProperty({ example: '+919876543210', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SocialAuthDto.prototype, "phone", void 0);
__decorate([
    ApiProperty({ example: 'social_provider_id', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], SocialAuthDto.prototype, "providerId", void 0);
class RefreshTokenDto {
    refreshToken;
}
__decorate([
    ApiProperty({ example: 'eyJhbGci...' }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class ForgotPasswordDto {
    email;
}
__decorate([
    ApiProperty({ example: 'rahul@example.com' }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class UpdateProfileDto {
    name;
    phone;
    email;
    avatarUrl;
    dob;
    gender;
    userRole;
    streetAddress;
    city;
    state;
    pincode;
    alternatePhone;
    alternateEmail;
    summary;
    settings;
}
__decorate([
    ApiProperty({ example: 'Rahul Google User', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "name", void 0);
__decorate([
    ApiProperty({ example: '+91 98490 63269', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "phone", void 0);
__decorate([
    ApiProperty({ example: 'rahul.google.test@gmail.com', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'https://images.unsplash.com/...', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "avatarUrl", void 0);
__decorate([
    ApiProperty({ example: '1990-05-15', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "dob", void 0);
__decorate([
    ApiProperty({ example: 'Male', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "gender", void 0);
__decorate([
    ApiProperty({ example: 'Owner', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "userRole", void 0);
__decorate([
    ApiProperty({ example: 'Plot 42, Road No. 36, Jubilee Hills', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "streetAddress", void 0);
__decorate([
    ApiProperty({ example: 'Hyderabad', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "city", void 0);
__decorate([
    ApiProperty({ example: 'Telangana', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "state", void 0);
__decorate([
    ApiProperty({ example: '500033', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "pincode", void 0);
__decorate([
    ApiProperty({ example: '+91 95678 89900', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "alternatePhone", void 0);
__decorate([
    ApiProperty({ example: 'alternate@example.com', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "alternateEmail", void 0);
__decorate([
    ApiProperty({
        example: { savedCount: 3, activityCount: 14, propertiesCount: 5, servicesCount: 4 },
        required: false,
        description: 'Quick access counts for Saved Properties, Activity, Properties, Services',
    }),
    IsOptional(),
    __metadata("design:type", Object)
], UpdateProfileDto.prototype, "summary", void 0);
__decorate([
    ApiProperty({
        example: {
            whatsappUpdates: true,
            pushNotifications: true,
            emailUpdates: true,
            smsAlerts: false,
            offersPromotions: true,
            visitReminders: true,
            useLocation: true,
        },
        required: false,
        description: 'Account settings preferences and notifications',
    }),
    IsOptional(),
    __metadata("design:type", Object)
], UpdateProfileDto.prototype, "settings", void 0);
class UploadAvatarDto {
    avatarUrl;
    imageBase64;
}
__decorate([
    ApiProperty({ example: 'https://images.unsplash.com/...', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UploadAvatarDto.prototype, "avatarUrl", void 0);
__decorate([
    ApiProperty({ example: 'data:image/jpeg;base64,...', required: false }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UploadAvatarDto.prototype, "imageBase64", void 0);
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async login(dto) {
        return this.authService.login(dto);
    }
    async sendOtp(dto) {
        const id = dto.identifier || dto.phone || dto.mobile || dto.email || '';
        return this.authService.sendOtp(id);
    }
    async resendOtp(dto) {
        const id = dto.identifier || dto.phone || dto.mobile || dto.email || '';
        return this.authService.resendOtp(id);
    }
    async verifyOtp(dto) {
        const id = dto.identifier || dto.phone || dto.mobile || dto.email || '';
        return this.authService.verifyOtp(id, dto.otp, dto.name);
    }
    async completeSignup(dto) {
        return this.authService.completeSignup(dto);
    }
    async googleAuth(dto) {
        return this.authService.googleAuth(dto);
    }
    async appleAuth(dto) {
        return this.authService.socialAuth({ ...dto, provider: 'apple' });
    }
    async refreshToken(dto) {
        return this.authService.refreshTokens(dto.refreshToken);
    }
    async forgotPassword(dto) {
        return this.authService.forgotPassword(dto.email);
    }
    async getMe(req) {
        let sub = req.user?.sub;
        if (!sub) {
            const authHeader = req.headers?.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                const payload = this.authService.verifyAccessToken(token);
                sub = payload?.sub || payload?.id;
            }
        }
        if (!sub) {
            return { authenticated: false, user: null, message: 'No active authenticated session' };
        }
        return this.authService.getCurrentUser(sub);
    }
    async updateMe(req, dto) {
        const userId = req.user?.sub || req.user?.id || 'usr_demo';
        return this.authService.updateProfile(userId, dto);
    }
    async updateProfile(req, dto) {
        const userId = req.user?.sub || req.user?.id || 'usr_demo';
        return this.authService.updateProfile(userId, dto);
    }
    async uploadAvatar(req, body) {
        const userId = req.user?.sub || req.user?.id || 'usr_demo';
        return this.authService.uploadAvatar(userId, body.avatarUrl || body.imageBase64 || '');
    }
    async deleteAvatar(req) {
        const userId = req.user?.sub || req.user?.id || 'usr_demo';
        return this.authService.deleteAvatar(userId);
    }
};
__decorate([
    Post('register'),
    ApiOperation({ summary: 'Register a new customer or owner' }),
    ApiResponse({ status: 201, description: 'User successfully registered' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    Post('login'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Log in with email/phone and password' }),
    ApiResponse({ status: 200, description: 'Login successful with JWT tokens' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Post('send-otp'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Send 6-digit OTP via MSG91',
        description: 'Sends a 6-digit verification code to the given Indian mobile number or email address (5-minute expiry, 30s resend cooldown).',
    }),
    ApiResponse({ status: 200, description: 'OTP dispatched successfully' }),
    ApiResponse({ status: 400, description: 'Invalid mobile/email or rate limit cooldown active' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
__decorate([
    Post('resend-otp'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Resend OTP via MSG91',
        description: 'Resends OTP code enforcing a 30-second cooldown period between attempts.',
    }),
    ApiResponse({ status: 200, description: 'OTP resent successfully' }),
    ApiResponse({ status: 400, description: 'Please wait for cooldown to expire before resending' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendOtp", null);
__decorate([
    Post('verify-otp'),
    HttpCode(HttpStatus.OK),
    ApiOperation({
        summary: 'Verify OTP and generate JWT authentication tokens',
        description: 'Verifies the 6-digit code via MSG91. Returns JWT access & refresh tokens along with user profile.',
    }),
    ApiResponse({ status: 200, description: 'OTP verified successfully; returns JWT tokens and user profile' }),
    ApiResponse({ status: 400, description: 'Malformed OTP or missing required fields' }),
    ApiResponse({ status: 401, description: 'Invalid or expired OTP code' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    Post('complete-signup'),
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ summary: 'Complete new user registration after mobile OTP verification' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CompleteSignupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "completeSignup", null);
__decorate([
    Post('google'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Authenticate or register via Google Sign-In with server-side ID token verification' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GoogleAuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    Post('apple'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Authenticate or register via Apple Sign-In' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SocialAuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "appleAuth", null);
__decorate([
    Post('refresh'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Refresh expired access token using JWT refresh token' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    Post('forgot-password'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Request password reset verification code' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    Get('me'),
    ApiOperation({ summary: 'Get current authenticated user profile' }),
    __param(0, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    Patch('me'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update profile details of current user' }),
    __param(0, Request()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateMe", null);
__decorate([
    Put('profile'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update profile details (PUT alias)' }),
    __param(0, Request()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    Post('upload-avatar'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Upload or update profile photo avatar' }),
    __param(0, Request()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UploadAvatarDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "uploadAvatar", null);
__decorate([
    Delete('avatar'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete current user profile photo' }),
    __param(0, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteAvatar", null);
AuthController = __decorate([
    ApiTags('Authentication'),
    Controller('api/v1/auth'),
    __metadata("design:paramtypes", [AuthService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map