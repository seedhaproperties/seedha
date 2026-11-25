export declare class SendChatMessageDto {
    propertyId: string;
    ownerName?: string;
    ownerPhone?: string;
    senderName?: string;
    senderType?: string;
    senderRole?: string;
    text?: string;
    message?: string;
    isPaymentPrompt?: boolean;
    paymentAmount?: number;
}
export declare class ChatWebhookDto {
    event: string;
    payload: any;
}
