export declare class RentalAgreementDetailsDto {
    landlordName?: string;
    ownerName?: string;
    landlordPhone?: string;
    ownerPhone?: string;
    landlordEmail?: string;
    landlordAddress?: string;
    tenantName: string;
    tenantPhone: string;
    tenantEmail?: string;
    tenantAddress?: string;
    propertyAddress: string;
    monthlyRent?: number;
    rentAmount?: number;
    securityDeposit?: number;
    depositAmount?: number;
    leaseTermMonths?: number;
    durationMonths?: number;
    agreementStartDate?: string;
    role?: string;
    stampDutyType?: string;
}
export declare class OrderAgreementDto {
    paymentTxnId: string;
    paymentAmount: number;
}
