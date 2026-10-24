export declare class RentalAgreementDetailsDto {
    landlordName: string;
    landlordPhone: string;
    landlordEmail?: string;
    landlordAddress: string;
    tenantName: string;
    tenantPhone: string;
    tenantEmail?: string;
    tenantAddress: string;
    propertyAddress: string;
    monthlyRent: number;
    securityDeposit: number;
    leaseTermMonths: number;
    agreementStartDate: string;
}
export declare class OrderAgreementDto {
    paymentTxnId: string;
    paymentAmount: number;
}
