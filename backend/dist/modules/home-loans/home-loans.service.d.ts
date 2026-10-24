import { HomeLoanRecord } from '../../common/mock-db.js';
import { CalculateLoanDto, LoanAssistanceRequestDto } from './home-loans.dto.js';
export declare class HomeLoansService {
    getLoanTypes(): {
        id: string;
        title: string;
        description: string;
        interestRateRange: string;
        maxTenureYears: number;
    }[];
    calculateEmiAndEligibility(dto: CalculateLoanDto): {
        loanAmount: number;
        interestRate: number;
        tenureYears: number;
        monthlyEmi: number;
        totalInterest: number;
        totalAmount: number;
        indicativeEligibility: {
            monthlyIncome: number;
            existingEmi: number;
            maxEligibleEmi: number;
            maxEligibleLoan: number;
            isEligibleForRequestedAmount: boolean;
        };
    };
    getBankLoansComparison(): {
        bankName: string;
        interestRate: string;
        processingFee: string;
        maxLtv: string;
        highlights: string;
    }[];
    getRequiredDocuments(loanType: string): {
        loanType: string;
        salaried: string[];
        selfEmployed: string[];
    };
    submitAssistanceRequest(dto: LoanAssistanceRequestDto, userId?: string): Promise<{
        message: string;
        request: HomeLoanRecord;
    }>;
    getMyLoanRequests(phoneOrUserId: string): HomeLoanRecord[];
}
