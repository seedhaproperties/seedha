export declare class CalculateLoanDto {
    loanAmount: number;
    interestRate: number;
    tenureYears: number;
    monthlyIncome?: number;
    existingEmi?: number;
}
export declare class LoanAssistanceRequestDto {
    userName: string;
    userPhone: string;
    userEmail?: string;
    loanType: string;
    propertyCost: number;
    loanAmount: number;
    tenureYears: number;
    monthlyIncome: number;
    existingEmi?: number;
    calculatedEmi: number;
    selectedBank?: string;
}
