import { PrismaService } from '../../database/prisma.service.js';
import { SendChatMessageDto, ChatWebhookDto } from './chat.dto.js';
export declare class ChatService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    sendMessage(dto: SendChatMessageDto, userId?: string): Promise<{
        success: boolean;
        conversationId: string;
        userMessage: {
            id: string;
            text: string;
            message: string;
            from: string;
            senderType: string;
            senderRole: string;
            senderName: string;
            createdAt: Date;
            isPaymentPrompt: boolean;
            paymentAmount: number | null;
            paymentStatus: string | null;
        };
        ownerReply: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        conversationId?: undefined;
        userMessage?: undefined;
        ownerReply?: undefined;
    }>;
    getConversation(propertyId: string, userId?: string): Promise<{
        messages: {
            id: string;
            text: string;
            message: string;
            from: string;
            senderType: string;
            senderRole: string;
            senderName: string;
            createdAt: Date;
            isPaymentPrompt: boolean;
            paymentAmount: number | null;
            paymentStatus: string | null;
        }[];
        property: {
            title: string;
            id: string;
            city: string;
            ownerPhone: string;
            images: string[];
            priceLabel: string;
            location: string;
            ownerName: string;
        } | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        ownerPhone: string;
        ownerId: string | null;
        ownerName: string;
        propertyId: string | null;
    } | null>;
    getChatStatus(propertyId: string, userId?: string): Promise<{
        isUnlocked: boolean;
        unlockFee: number;
        paidTxnId?: undefined;
        purpose?: undefined;
    } | {
        isUnlocked: boolean;
        unlockFee: number;
        paidTxnId: string;
        purpose: string;
    }>;
    handleWebhook(dto: ChatWebhookDto): Promise<{
        success: boolean;
        receivedEvent: string;
        timestamp: string;
    }>;
}
