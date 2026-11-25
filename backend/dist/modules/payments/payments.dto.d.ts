export declare class CreatePaymentOrderDto {
    amount: number;
    purpose: string;
    propertyId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    gatewayMethod?: string;
}
export declare class VerifyPaymentDto {
    orderId: string;
    paymentTxnId: string;
    signature?: string;
    amount: number;
    purpose: string;
    propertyId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    gatewayMethod?: string;
}
