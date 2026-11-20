import { Controller, Post, Get, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service.js';
import { SendChatMessageDto, ChatWebhookDto } from './chat.dto.js';

@ApiTags('Chat & Messaging')
@Controller('api/v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send message between property owner and customer with payment request support' })
  sendMessage(@Body() dto: SendChatMessageDto, @Request() req: any) {
    return this.chatService.sendMessage(dto, req.user?.sub);
  }

  @Get('conversation/:propertyId')
  @ApiOperation({ summary: 'Get full conversation history for property' })
  getConversation(@Param('propertyId') propertyId: string, @Request() req: any) {
    return this.chatService.getConversation(propertyId, req.user?.sub);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook endpoint for receiving real-time chat messages and delivery status' })
  handleWebhook(@Body() dto: ChatWebhookDto) {
    return this.chatService.handleWebhook(dto);
  }
}
