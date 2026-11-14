import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

class SendOtpDto {
  @ApiProperty({ example: 'rahul@example.com', description: 'Email address or mobile number' })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'rahul@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;
}

class VerifyOtpDto {
  @ApiProperty({ example: 'rahul@example.com' })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  otp!: string;
}

class ForgotPasswordDto {
  @ApiProperty({ example: 'rahul@example.com' })
  @IsNotEmpty()
  @IsString()
  email!: string;
}

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer, owner, or staff (sends welcome email via SMTP)' })
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
  @ApiOperation({ summary: 'Send 6-digit OTP to email via SMTP or SMS' })
  async sendOtp(@Body() dto: SendOtpDto) {
    const id = dto.identifier || dto.phone || dto.email || '';
    return this.authService.sendOtp(id);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP code and authenticate user' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const id = dto.identifier || dto.phone || '';
    return this.authService.verifyOtp(id, dto.otp);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset verification code via SMTP email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getMe(@Request() req: any) {
    return this.authService.getCurrentUser(req.user?.sub || 'usr_rahul');
  }
}
