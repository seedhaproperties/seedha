export declare class CalculateLoanDto {
    loanAmount: number;
    interestRate: number;
    tenureYears: number;
    monthlyIncome?: number;
    existingEmi?: number;
}
export declare class LoanAssistanceRequestDto {
    userName?: string;
    applicantName?: string;
    userPhone?: string;
    applicantPhone?: string;
    userEmail?: string;
    applicantEmail?: string;
    loanType?: string;
    propertyCost?: number;
    loanAmount?: number;
    tenureYears?: number;
    monthlyIncome?: number;
    existingEmi?: number;
    calculatedEmi?: number;
    selectedBank?: string;
    employmentType?: string;
    propertyIdentified?: boolean;
    panCard?: string;
    aadhaarNumber?: string;
    propertyAddress?: string;
}
export declare class CreateBankLoanOfferDto {
    bankName: string;
    bankCode: string;
    interestRateMin: number;
    interestRateMax?: number;
    minLoanAmount?: number;
    maxLoanAmount?: number;
    minTenureYears?: number;
    maxTenureYears?: number;
    processingFee: string;
    processingFeePercent?: number;
    maxLtvRatio?: number;
    badge?: string;
    highlights?: string;
    rateValidityDate?: string;
    lastUpdatedDate?: string;
    iconType?: string;
    iconBg?: string;
    iconColor?: string;
    isActive?: boolean;
    sortOrder?: number;
}
declare const UpdateBankLoanOfferDto_base: import("@nestjs/common").Type<Partial<CreateBankLoanOfferDto>>;
export declare class UpdateBankLoanOfferDto extends UpdateBankLoanOfferDto_base {
}
export {};
