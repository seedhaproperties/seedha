import { Controller, Post, Get, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Public } from '../../common/guards/jwt-auth.guard.js';
import { FirebaseNotificationService } from './firebase-notification.service.js';
import { RegisterDeviceTokenDto, UnregisterDeviceTokenDto } from './dto/register-token.dto.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { SendMulticastNotificationDto } from './dto/send-multicast.dto.js';
import { TestNotificationDto } from './dto/test-notification.dto.js';

@ApiTags('Notifications')
@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FirebaseNotificationController {
  constructor(private readonly notificationService: FirebaseNotificationService) {}

  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Check live Firebase Admin SDK connection, credential validity and authentication status',
  })
  @ApiResponse({ status: 200, description: 'Firebase connection health status' })
  async checkHealth() {
    return this.notificationService.checkHealth();
  }

  @Public()
  @Get('feed')
  @ApiOperation({
    summary: 'Get real live notification feed for the current user',
  })
  @ApiResponse({ status: 200, description: 'Real notification feed list' })
  async getFeed(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.query?.userId;
    return this.notificationService.getUserNotificationFeed(userId);
  }

  @Post('test-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a test push notification to a specific FCM device token to verify delivery',
  })
  @ApiResponse({ status: 200, description: 'Test notification delivery result from Firebase' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendTestToken(@Body() dto: TestNotificationDto) {
    return this.notificationService.sendTestNotification(
      dto.token,
      dto.title,
      dto.body,
      dto.data,
    );
  }

  @Public()
  @Post('device-token')
  @ApiOperation({
    summary: 'Register or refresh an FCM device push token for a user',
  })
  @ApiResponse({ status: 201, description: 'Device token registered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async registerDeviceToken(@Req() req: any, @Body() dto: RegisterDeviceTokenDto) {
    const userId = req.user?.sub || req.user?.id || dto.userId;
    if (!userId) {
      return { success: false, message: 'User ID is required to register device token' };
    }
    return this.notificationService.registerDeviceToken(userId, dto.token, dto.platform);
  }

  @Post('device-token/unregister')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unregister an FCM device token upon user logout',
  })
  @ApiResponse({ status: 200, description: 'Device token unregistered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unregisterDeviceToken(@Req() req: any, @Body() dto: UnregisterDeviceTokenDto) {
    const userId = req.user?.sub || req.user?.id;
    return this.notificationService.unregisterDeviceToken(userId, dto.token);
  }

  @Get('my-devices')
  @ApiOperation({
    summary: 'Get all active registered device tokens for the current user',
  })
  @ApiResponse({ status: 200, description: 'List of registered devices' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyDevices(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.notificationService.getDeviceTokensForUser(userId);
  }

  @Post('send-to-user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send an FCM push notification to all active devices of a target user',
  })
  @ApiResponse({ status: 200, description: 'Push notification delivery result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async sendToUser(@Body() dto: SendNotificationDto) {
    return this.notificationService.sendToUser(dto.userId, {
      title: dto.title,
      body: dto.body,
      data: dto.data,
    });
  }

  @Post('send-multicast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send an FCM push notification to multiple target users simultaneously',
  })
  @ApiResponse({ status: 200, description: 'Multicast push notification delivery result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendMulticast(@Body() dto: SendMulticastNotificationDto) {
    return this.notificationService.sendToUsers(dto.userIds, {
      title: dto.title,
      body: dto.body,
      data: dto.data,
    });
  }

  @Post('announcement')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Broadcast an admin announcement to all registered device tokens across all active users',
  })
  @ApiResponse({ status: 200, description: 'Broadcast announcement result' })
  async broadcastAnnouncement(
    @Body() dto: { title: string; body: string; data?: Record<string, string> },
  ) {
    return this.notificationService.sendAnnouncement(dto.title, dto.body, dto.data);
  }
}
