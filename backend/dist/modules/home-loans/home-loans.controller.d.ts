import { HomeLoansService } from './home-loans.service.js';
import { CalculateLoanDto, LoanAssistanceRequestDto } from './home-loans.dto.js';
export declare class HomeLoansController {
    private readonly homeLoansService;
    constructor(homeLoansService: HomeLoansService);
    getLoanTypes(): {
        id: string;
        title: string;
        description: string;
        interestRateRange: string;
        maxTenureYears: number;
    }[];
    calculateEmi(dto: CalculateLoanDto): {
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
    compareBanks(): {
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
    requestAssistance(dto: LoanAssistanceRequestDto, req: any): Promise<{
        message: string;
        request: import("../../common/mock-db.js").HomeLoanRecord;
    }>;
    getMyRequests(req: any): Promise<import("../../common/mock-db.js").HomeLoanRecord[]>;
}
