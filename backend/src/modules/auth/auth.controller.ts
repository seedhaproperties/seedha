import { Controller, Post, Body, Get, Patch, Put, Delete, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsEmail } from 'class-validator';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

class SendOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Email address or 10-digit mobile number', required: false })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiProperty({ example: '+919876543210', description: 'Mobile phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '9876543210', description: '10-digit Indian mobile number', required: false })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ example: 'rahul@example.com', description: 'Email address', required: false })
  @IsOptional()
  @IsString()
  email?: string;
}

class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Email address or 10-digit mobile number', required: false })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '9876543210', required: false })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ example: 'rahul@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsNotEmpty()
  @IsString()
  otp!: string;

  @ApiProperty({ example: 'Rahul Sharma', required: false, description: 'Optional user full name' })
  @IsOptional()
  @IsString()
  name?: string;
}

class CompleteSignupDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'rahul@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}

class GoogleAuthDto {
  @ApiProperty({ example: '4/0AVMBs...', required: false, description: 'Google OAuth 2.0 PKCE authorization code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: 'pkce_code_verifier_string', required: false, description: 'PKCE code verifier for authorization code exchange' })
  @IsOptional()
  @IsString()
  codeVerifier?: string;

  @ApiProperty({ example: 'https://auth.expo.io', required: false, description: 'OAuth redirect URI used during code authorization' })
  @IsOptional()
  @IsString()
  redirectUri?: string;

  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIs...', required: false })
  @IsOptional()
  @IsString()
  idToken?: string;

  @ApiProperty({ example: 'ya29.a0AfH6...', required: false })
  @IsOptional()
  @IsString()
  accessToken?: string;

  @ApiProperty({ example: 'rahul@gmail.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Rahul Sharma', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

class SocialAuthDto {
  @ApiProperty({ example: 'rahul@gmail.com' })
  @IsNotEmpty()
  @IsString()
  email!: string;

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'social_provider_id', required: false })
  @IsOptional()
  @IsString()
  providerId?: string;
}

class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGci...' })
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}

class ForgotPasswordDto {
  @ApiProperty({ example: 'rahul@example.com' })
  @IsNotEmpty()
  @IsString()
  email!: string;
}

class UpdateProfileDto {
  @ApiProperty({ example: 'Rahul Google User', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '+91 98490 63269', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'rahul.google.test@gmail.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'https://images.unsplash.com/...', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: '1990-05-15', required: false })
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiProperty({ example: 'Male', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: 'Owner', required: false })
  @IsOptional()
  @IsString()
  userRole?: string;

  @ApiProperty({ example: 'Plot 42, Road No. 36, Jubilee Hills', required: false })
  @IsOptional()
  @IsString()
  streetAddress?: string;

  @ApiProperty({ example: 'Hyderabad', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Telangana', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '500033', required: false })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiProperty({ example: '+91 95678 89900', required: false })
  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @ApiProperty({ example: 'alternate@example.com', required: false })
  @IsOptional()
  @IsString()
  alternateEmail?: string;

  @ApiProperty({
    example: { savedCount: 3, activityCount: 14, propertiesCount: 5, servicesCount: 4 },
    required: false,
    description: 'Quick access counts for Saved Properties, Activity, Properties, Services',
  })
  @IsOptional()
  summary?: {
    savedCount?: number;
    activityCount?: number;
    propertiesCount?: number;
    servicesCount?: number;
  };

  @ApiProperty({
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
  })
  @IsOptional()
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

class UploadAvatarDto {
  @ApiProperty({ example: 'https://images.unsplash.com/...', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: 'data:image/jpeg;base64,...', required: false })
  @IsOptional()
  @IsString()
  imageBase64?: string;
}

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer or owner' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email/phone and password' })
  @ApiResponse({ status: 200, description: 'Login successful with JWT tokens' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send 6-digit OTP via MSG91',
    description: 'Sends a 6-digit verification code to the given Indian mobile number or email address (5-minute expiry, 30s resend cooldown).',
  })
  @ApiResponse({ status: 200, description: 'OTP dispatched successfully' })
  @ApiResponse({ status: 400, description: 'Invalid mobile/email or rate limit cooldown active' })
  async sendOtp(@Body() dto: SendOtpDto) {
    const id = dto.identifier || dto.phone || dto.mobile || dto.email || '';
    return this.authService.sendOtp(id);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend OTP via MSG91',
    description: 'Resends OTP code enforcing a 30-second cooldown period between attempts.',
  })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  @ApiResponse({ status: 400, description: 'Please wait for cooldown to expire before resending' })
  async resendOtp(@Body() dto: SendOtpDto) {
    const id = dto.identifier || dto.phone || dto.mobile || dto.email || '';
    return this.authService.resendOtp(id);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP and generate JWT authentication tokens',
    description: 'Verifies the 6-digit code via MSG91. Returns JWT access & refresh tokens along with user profile.',
  })
  @ApiResponse({ status: 200, description: 'OTP verified successfully; returns JWT tokens and user profile' })
  @ApiResponse({ status: 400, description: 'Malformed OTP or missing required fields' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP code' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const id = dto.identifier || dto.phone || dto.mobile || dto.email || '';
    return this.authService.verifyOtp(id, dto.otp, dto.name);
  }

  @Post('complete-signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Complete new user registration after mobile OTP verification' })
  async completeSignup(@Body() dto: CompleteSignupDto) {
    return this.authService.completeSignup(dto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate or register via Google Sign-In with server-side ID token verification' })
  async googleAuth(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto);
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate or register via Apple Sign-In' })
  async appleAuth(@Body() dto: SocialAuthDto) {
    return this.authService.socialAuth({ ...dto, provider: 'apple' });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh expired access token using JWT refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset verification code' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getMe(@Request() req: any) {
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

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile details of current user' })
  async updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user?.sub || req.user?.id || 'usr_demo';
    return this.authService.updateProfile(userId, dto);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile details (PUT alias)' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user?.sub || req.user?.id || 'usr_demo';
    return this.authService.updateProfile(userId, dto);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload or update profile photo avatar' })
  async uploadAvatar(@Request() req: any, @Body() body: UploadAvatarDto) {
    const userId = req.user?.sub || req.user?.id || 'usr_demo';
    return this.authService.uploadAvatar(userId, body.avatarUrl || body.imageBase64 || '');
  }

  @Delete('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user profile photo' })
  async deleteAvatar(@Request() req: any) {
    const userId = req.user?.sub || req.user?.id || 'usr_demo';
    return this.authService.deleteAvatar(userId);
  }
}
