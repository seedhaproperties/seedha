import { HomeLoansService } from './home-loans.service.js';
import { CalculateLoanDto, LoanAssistanceRequestDto, CreateBankLoanOfferDto, UpdateBankLoanOfferDto } from './home-loans.dto.js';
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
        amortizationSummary: {
            principalPercent: number;
            interestPercent: number;
            totalPaymentsCount: number;
        };
        indicativeEligibility: {
            monthlyIncome: number;
            existingEmi: number;
            maxEligibleEmi: number;
            maxEligibleLoan: number;
            isEligibleForRequestedAmount: boolean;
        };
        disclaimer: string;
    };
    compareBanks(loanAmount?: number, tenureYears?: number): Promise<{
        loanAmount: number;
        tenureYears: number;
        count: number;
        comparisonHighlights: {
            lowestInterestRate: any;
            lowestMonthlyEmi: any;
            lowestProcessingFee: any;
        };
        disclaimer: string;
        offers: {
            id: any;
            bankName: any;
            bankCode: any;
            interestRateMin: any;
            interestRateMax: any;
            interestRate: string;
            monthlyEmi: number;
            monthlyEmiFormatted: string;
            totalInterest: number;
            totalInterestFormatted: string;
            totalRepayment: number;
            totalRepaymentFormatted: string;
            minLoanAmount: any;
            maxLoanAmount: any;
            maxLoan: string;
            minTenureYears: any;
            maxTenureYears: any;
            processingFee: any;
            processingFeePercent: any;
            estimatedProcessingFee: any;
            maxLtvRatio: any;
            maxLtv: string;
            badge: any;
            highlights: any;
            rateValidityDate: any;
            lastUpdatedDate: any;
            iconType: any;
            iconBg: any;
            iconColor: any;
            isActive: any;
            sortOrder: any;
        }[];
    }>;
    getRequiredDocuments(loanType: string): {
        loanType: string;
        salaried: string[];
        selfEmployed: string[];
    };
    requestAssistance(dto: LoanAssistanceRequestDto, req: any): Promise<{
        message: string;
        request: import("../../common/mock-db.js").HomeLoanRecord;
    }>;
    getMyRequests(req: any): Promise<import("../../common/mock-db.js").HomeLoanRecord[] | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        userEmail: string | null;
        userPhone: string;
        status: string;
        userName: string;
        contactNotes: string | null;
        loanAmount: number;
        tenureYears: number;
        monthlyIncome: number;
        existingEmi: number;
        loanType: string;
        propertyCost: number;
        calculatedEmi: number;
        selectedBank: string | null;
        assignedStaff: string | null;
    }[]>;
    getAdminOffers(includeInactive?: string): Promise<import("../../common/mock-db.js").BankLoanOfferRecord[] | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bankName: string;
        bankCode: string;
        interestRateMin: number;
        interestRateMax: number | null;
        minLoanAmount: number;
        maxLoanAmount: number;
        minTenureYears: number;
        maxTenureYears: number;
        processingFee: string;
        processingFeePercent: number | null;
        maxLtvRatio: number;
        badge: string | null;
        highlights: string | null;
        rateValidityDate: string | null;
        lastUpdatedDate: string | null;
        iconType: string | null;
        iconBg: string | null;
        iconColor: string | null;
        isActive: boolean;
        sortOrder: number;
    }[]>;
    createAdminOffer(dto: CreateBankLoanOfferDto): Promise<{
        message: string;
        offer: import("../../common/mock-db.js").BankLoanOfferRecord;
    }>;
    updateAdminOffer(id: string, dto: UpdateBankLoanOfferDto): Promise<{
        message: string;
        offer: import("../../common/mock-db.js").BankLoanOfferRecord | undefined;
    }>;
    toggleAdminOffer(id: string, isActive?: boolean): Promise<{
        message: string;
        id: string;
        isActive: boolean;
    }>;
    deleteAdminOffer(id: string): Promise<{
        message: string;
    }>;
}
