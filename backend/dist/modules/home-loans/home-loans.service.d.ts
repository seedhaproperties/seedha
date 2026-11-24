import { HomeLoanRecord, BankLoanOfferRecord } from '../../common/mock-db.js';
import { CalculateLoanDto, LoanAssistanceRequestDto, CreateBankLoanOfferDto, UpdateBankLoanOfferDto } from './home-loans.dto.js';
import { PrismaService } from '../../database/prisma.service.js';
export declare class HomeLoansService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getLoanTypes(): {
        id: string;
        title: string;
        description: string;
        interestRateRange: string;
        maxTenureYears: number;
    }[];
    calculateMonthlyEmi(principal: number, annualRate: number, tenureYears: number): number;
    calculateEmiAndEligibility(dto: CalculateLoanDto): {
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
    formatMaxLoanDisplay(amount: number): string;
    getBankLoansComparison(loanAmount?: number, tenureYears?: number): Promise<{
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
    getAllOffers(includeInactive?: boolean): Promise<BankLoanOfferRecord[] | {
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
    createOffer(dto: CreateBankLoanOfferDto): Promise<{
        message: string;
        offer: BankLoanOfferRecord;
    }>;
    updateOffer(id: string, dto: UpdateBankLoanOfferDto): Promise<{
        message: string;
        offer: BankLoanOfferRecord | undefined;
    }>;
    toggleOfferStatus(id: string, isActive?: boolean): Promise<{
        message: string;
        id: string;
        isActive: boolean;
    }>;
    deleteOffer(id: string): Promise<{
        message: string;
    }>;
    getRequiredDocuments(loanType: string): {
        loanType: string;
        salaried: string[];
        selfEmployed: string[];
    };
    submitAssistanceRequest(dto: LoanAssistanceRequestDto, userId?: string): Promise<{
        message: string;
        request: HomeLoanRecord;
    }>;
    getMyLoanRequests(phoneOrUserId: string): Promise<HomeLoanRecord[] | {
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
}
