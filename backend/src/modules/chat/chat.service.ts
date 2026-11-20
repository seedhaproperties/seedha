import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { SendChatMessageDto, ChatWebhookDto } from './chat.dto.js';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(dto: SendChatMessageDto, userId?: string) {
    const targetUserId = userId || `user_guest_${Date.now()}`;
    const ownerName = dto.ownerName || 'Property Owner';
    const ownerPhone = dto.ownerPhone || '+91 98765 43210';

    try {
      // Find or create conversation in DB
      let conversation = await this.prisma.chatConversation.findFirst({
        where: {
          propertyId: dto.propertyId,
          userId: targetUserId,
        },
      });

      if (!conversation) {
        conversation = await this.prisma.chatConversation.create({
          data: {
            propertyId: dto.propertyId,
            userId: targetUserId,
            ownerName,
            ownerPhone,
          },
        });
      }

      // Save user message
      const savedMessage = await this.prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: targetUserId,
          senderName: dto.senderName,
          senderType: dto.senderType,
          text: dto.text,
          isPaymentPrompt: Boolean(dto.isPaymentPrompt),
          paymentAmount: dto.paymentAmount || null,
          paymentStatus: dto.isPaymentPrompt ? 'PENDING' : null,
        },
      });

      this.logger.log(`💬 Message saved for property ${dto.propertyId} from ${dto.senderName}`);

      // Auto-reply simulation from Owner if customer sent a question
      let ownerReply: any = null;
      if (dto.senderType === 'USER') {
        const lower = dto.text.toLowerCase();
        let replyText = "Hello! Thank you for reaching out. Yes, the property is available and we can schedule a visit at your convenience.";
        let paymentPrompt = false;
        let pAmount = null;

        if (lower.includes('negotiable') || lower.includes('price') || lower.includes('cost')) {
          replyText = "We can discuss. The listed price is our best offer, but we can work out on the furnishing or registration charges.";
        } else if (lower.includes('token') || lower.includes('book') || lower.includes('pay') || lower.includes('advance')) {
          replyText = `Sure! You can reserve this property by paying a secure token advance of ₹2,000 through Seedha Properties escrow protection.`;
          paymentPrompt = true;
          pAmount = 2000;
        } else if (lower.includes('visit') || lower.includes('tomorrow') || lower.includes('sunday')) {
          replyText = "Yes, you can book a visit through Seedha app anytime between 10:00 AM and 6:00 PM. Our executive will also assist you at the gate.";
        }

        ownerReply = await this.prisma.chatMessage.create({
          data: {
            conversationId: conversation.id,
            senderId: `owner_${conversation.id}`,
            senderName: ownerName,
            senderType: 'OWNER',
            text: replyText,
            isPaymentPrompt: paymentPrompt,
            paymentAmount: pAmount,
            paymentStatus: paymentPrompt ? 'PENDING' : null,
          },
        });
      }

      return {
        success: true,
        conversationId: conversation.id,
        userMessage: savedMessage,
        ownerReply,
      };
    } catch (err: any) {
      this.logger.error(`Error saving chat message: ${err.message}`);
      return {
        success: false,
        error: err.message,
      };
    }
  }

  async getConversation(propertyId: string, userId?: string) {
    try {
      const conv = await this.prisma.chatConversation.findFirst({
        where: {
          propertyId,
          ...(userId ? { userId } : {}),
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          property: {
            select: {
              id: true,
              title: true,
              location: true,
              city: true,
              priceLabel: true,
              images: true,
              ownerName: true,
              ownerPhone: true,
            },
          },
        },
      });

      return conv;
    } catch {
      return null;
    }
  }

  async handleWebhook(dto: ChatWebhookDto) {
    this.logger.log(`📥 Incoming Chat Webhook received: [${dto.event}]`);
    return {
      success: true,
      receivedEvent: dto.event,
      timestamp: new Date().toISOString(),
    };
  }
}
