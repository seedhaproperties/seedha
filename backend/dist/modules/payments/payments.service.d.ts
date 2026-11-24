import { PrismaService } from '../../database/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { FirebaseNotificationService } from '../firebase-notification/firebase-notification.service.js';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './payments.dto.js';
export declare class PaymentsService {
    private readonly prisma;
    private readonly emailService;
    private readonly notificationService?;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService, notificationService?: FirebaseNotificationService | undefined);
    createOrder(dto: CreatePaymentOrderDto, userId?: string): Promise<{
        success: boolean;
        orderId: string;
        amount: number;
        currency: string;
        purpose: string;
        propertyId: string | undefined;
        customerName: string;
        customerPhone: string;
        customerEmail: string | undefined;
        gateway: string;
        keyId: string;
        mode: string;
    }>;
    verifyPayment(dto: VerifyPaymentDto, userId?: string): Promise<{
        success: boolean;
        message: string;
        transaction: {
            id: string;
            referenceId: string;
            amount: number;
            purpose: string;
            propertyId: string | null;
            status: string;
            paidAt: Date;
            customerName: string;
            customerPhone: string;
        };
    }>;
    getMyTransactions(userId?: string, phone?: string): Promise<{
        id: string;
        referenceId: string;
        amount: number;
        amountLabel: string;
        purpose: string;
        status: string;
        dateTime: string;
        paidTo: string;
        customerName: string;
        customerPhone: string;
        property: {
            title: string;
            id: string;
            city: string;
            images: string[];
            priceLabel: string;
            location: string;
        } | null;
    }[]>;
    getAllTransactions(): Promise<{
        id: string;
        referenceId: string;
        amount: number;
        amountLabel: string;
        purpose: string;
        status: string;
        gateway: string;
        customerName: string;
        customerPhone: string;
        createdAt: Date;
        user: {
            name: string;
            email: string;
            phone: string;
            id: string;
        } | null;
        property: {
            title: string;
            id: string;
            city: string;
            location: string;
        } | null;
    }[]>;
    handleWebhook(payload: any, signature?: string): Promise<{
        status: string;
        received: boolean;
        event: any;
    }>;
    processRefund(transactionId: string, reason?: string): Promise<{
        success: boolean;
        message: string;
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            propertyId: string | null;
            amount: number;
            purpose: string;
            customerName: string;
            customerPhone: string;
            customerEmail: string | null;
            gateway: string;
            gatewayTxnId: string;
            paymentStatus: string;
            metadata: string | null;
        };
    }>;
    getTermsAndConditions(): {
        title: string;
        lastUpdated: string;
        sections: {
            heading: string;
            content: string;
        }[];
    };
}
