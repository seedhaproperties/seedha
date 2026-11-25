import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { FirebaseNotificationService } from '../firebase-notification/firebase-notification.service.js';
import { SendChatMessageDto, ChatWebhookDto } from './chat.dto.js';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationService: FirebaseNotificationService,
  ) {}

  async sendMessage(dto: SendChatMessageDto, userId?: string) {
    const targetUserId = userId || `user_guest_${Date.now()}`;
    const ownerName = dto.ownerName || 'Property Owner';
    const ownerPhone = dto.ownerPhone || '+91 98765 43210';
    const messageText = (dto.text || dto.message || '').trim();
    const senderName = dto.senderName || 'Customer';
    const senderType = (dto.senderType || (dto.senderRole === 'CUSTOMER' ? 'USER' : dto.senderRole) || 'USER').toUpperCase();

    if (!messageText) {
      return { success: false, error: 'Message cannot be empty' };
    }

    try {
      // Find or create conversation in DB
      let conversation = await this.prisma.chatConversation.findFirst({
        where: {
          propertyId: dto.propertyId,
          ...(userId ? { userId } : {}),
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

      // Save user message in PostgreSQL
      const savedMessage = await this.prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: targetUserId,
          senderName,
          senderType,
          text: messageText,
          isPaymentPrompt: Boolean(dto.isPaymentPrompt),
          paymentAmount: dto.paymentAmount || null,
          paymentStatus: dto.isPaymentPrompt ? 'PENDING' : null,
        },
      });

      this.logger.log(`💬 Message saved for property ${dto.propertyId} from ${senderName}: "${messageText.slice(0, 30)}..."`);

      // Dispatch Property Enquiry Email asynchronously to owner if user enquiry
      if (senderType === 'USER' && dto.propertyId) {
        (async () => {
          try {
            const prop = await this.prisma.property.findUnique({
              where: { id: dto.propertyId },
              include: { owner: true },
            });
            const ownerEmail = prop?.owner?.email || process.env.SMTP_USER;
            if (ownerEmail) {
              await this.emailService.sendPropertyEnquiry(ownerEmail, {
                propertyTitle: prop?.title || `Property #${dto.propertyId}`,
                customerName: senderName,
                customerPhone: dto.ownerPhone,
                message: messageText,
              });
              this.logger.log(`📧 Property enquiry email dispatched to ${ownerEmail}`);
            }

            // Dispatch FCM Push Notification to property owner
            const ownerId = prop?.ownerId || (prop?.owner as any)?.id;
            if (ownerId) {
              await this.notificationService.sendPropertyEnquiryNotification(
                ownerId,
                prop?.title || 'Your Property',
                senderName,
                messageText,
                dto.propertyId,
              );
              this.logger.log(`📲 Property enquiry FCM push notification dispatched to owner ${ownerId}`);
            }
          } catch (mailErr: any) {
            this.logger.warn(`Property enquiry email notice: ${mailErr?.message}`);
          }
        })();
      }

      // Owner response generation / simulation
      let ownerReply: any = null;
      if (senderType === 'USER') {
        const lower = messageText.toLowerCase();
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
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
          replyText = `Hello! Glad to connect with you regarding the property. How can I help you today?`;
        }

        const savedOwnerReply = await this.prisma.chatMessage.create({
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

        ownerReply = {
          id: savedOwnerReply.id,
          text: savedOwnerReply.text,
          message: savedOwnerReply.text,
          from: 'owner',
          senderType: 'OWNER',
          senderRole: 'OWNER',
          senderName: ownerName,
          createdAt: savedOwnerReply.createdAt,
          isPaymentPrompt: paymentPrompt,
          paymentAmount: pAmount,
          paymentStatus: savedOwnerReply.paymentStatus,
        };
      }

      return {
        success: true,
        conversationId: conversation.id,
        userMessage: {
          id: savedMessage.id,
          text: savedMessage.text,
          message: savedMessage.text,
          from: 'user',
          senderType,
          senderRole: 'CUSTOMER',
          senderName,
          createdAt: savedMessage.createdAt,
          isPaymentPrompt: savedMessage.isPaymentPrompt,
          paymentAmount: savedMessage.paymentAmount,
          paymentStatus: savedMessage.paymentStatus,
        },
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

      if (!conv) {
        return null;
      }

      const mappedMessages = conv.messages.map((m) => ({
        id: m.id,
        text: m.text,
        message: m.text,
        from: m.senderType === 'OWNER' ? 'owner' : 'user',
        senderType: m.senderType,
        senderRole: m.senderType === 'OWNER' ? 'OWNER' : 'CUSTOMER',
        senderName: m.senderName,
        createdAt: m.createdAt,
        isPaymentPrompt: m.isPaymentPrompt,
        paymentAmount: m.paymentAmount,
        paymentStatus: m.paymentStatus,
      }));

      return {
        ...conv,
        messages: mappedMessages,
      };
    } catch {
      return null;
    }
  }

  async getChatStatus(propertyId: string, userId?: string) {
    const unlockFee = 99;

    if (!propertyId) {
      return { isUnlocked: false, unlockFee };
    }

    try {
      if (userId) {
        const payment = await this.prisma.paymentTransaction.findFirst({
          where: {
            propertyId,
            userId,
            paymentStatus: 'SUCCESS',
          },
        });

        if (payment) {
          return {
            isUnlocked: true,
            unlockFee,
            paidTxnId: payment.gatewayTxnId,
            purpose: payment.purpose,
          };
        }
      }

      return {
        isUnlocked: false,
        unlockFee,
      };
    } catch {
      return { isUnlocked: false, unlockFee };
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
