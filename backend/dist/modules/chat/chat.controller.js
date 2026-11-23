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
import { Controller, Post, Get, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service.js';
import { SendChatMessageDto, ChatWebhookDto } from './chat.dto.js';
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    sendMessage(dto, req) {
        return this.chatService.sendMessage(dto, req.user?.sub);
    }
    getChatStatus(propertyId, req) {
        return this.chatService.getChatStatus(propertyId, req.user?.sub);
    }
    getConversation(propertyId, req) {
        return this.chatService.getConversation(propertyId, req.user?.sub);
    }
    handleWebhook(dto) {
        return this.chatService.handleWebhook(dto);
    }
};
__decorate([
    Post('message'),
    ApiOperation({ summary: 'Send message between property owner and customer with payment request support' }),
    __param(0, Body()),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendChatMessageDto, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "sendMessage", null);
__decorate([
    Get('status/:propertyId'),
    ApiOperation({ summary: 'Check if chat is unlocked for property' }),
    __param(0, Param('propertyId')),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getChatStatus", null);
__decorate([
    Get('conversation/:propertyId'),
    ApiOperation({ summary: 'Get full conversation history for property' }),
    __param(0, Param('propertyId')),
    __param(1, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getConversation", null);
__decorate([
    Post('webhook'),
    ApiOperation({ summary: 'Webhook endpoint for receiving real-time chat messages and delivery status' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ChatWebhookDto]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "handleWebhook", null);
ChatController = __decorate([
    ApiTags('Chat & Messaging'),
    Controller('api/v1/chat'),
    __metadata("design:paramtypes", [ChatService])
], ChatController);
export { ChatController };
//# sourceMappingURL=chat.controller.js.map