import { ChatService } from './chat.service.js';
import { SendChatMessageDto, ChatWebhookDto } from './chat.dto.js';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    sendMessage(dto: SendChatMessageDto, req: any): Promise<{
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
    getChatStatus(propertyId: string, req: any): Promise<{
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
    getConversation(propertyId: string, req: any): Promise<{
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
    handleWebhook(dto: ChatWebhookDto): Promise<{
        success: boolean;
        receivedEvent: string;
        timestamp: string;
    }>;
}
