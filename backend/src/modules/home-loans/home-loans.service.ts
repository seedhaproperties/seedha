import { Injectable } from '@nestjs/common';
import { mockDb, HomeLoanRecord } from '../../common/mock-db.js';
import { CalculateLoanDto, LoanAssistanceRequestDto } from './home-loans.dto.js';

@Injectable()
export class HomeLoansService {
  getLoanTypes() {
    return [
      {
        id: 'home_purchase',
        title: 'Home Purchase Loan',
        description: 'For purchasing a new or resale flat, apartment, or independent house.',
        interestRateRange: '8.35% - 9.15% p.a.',
        maxTenureYears: 30,
      },
      {
        id: 'home_construction',
        title: 'Home Construction Loan',
        description: 'Financing to construct a house on your owned residential plot.',
        interestRateRange: '8.45% - 9.30% p.a.',
        maxTenureYears: 25,
      },
      {
        id: 'plot_loan',
        title: 'Plot & Land Loan',
        description: 'For buying residential plots in approved layouts and gated ventures.',
        interestRateRange: '8.75% - 9.60% p.a.',
        maxTenureYears: 20,
      },
      {
        id: 'balance_transfer',
        title: 'Balance Transfer & Top-Up',
        description: 'Transfer existing loan to lower interest rate with additional top-up funds.',
        interestRateRange: '8.30% - 8.85% p.a.',
        maxTenureYears: 30,
      },
    ];
  }

  calculateEmiAndEligibility(dto: CalculateLoanDto) {
    const P = dto.loanAmount;
    const r = dto.interestRate / 12 / 100;
    const n = dto.tenureYears * 12;

    // Standard EMI formula: [P * r * (1+r)^n] / [(1+r)^n - 1]
    const emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const totalAmount = emi * n;
    const totalInterest = totalAmount - P;

    // Eligibility calculation (Standard FOIR at 50% of monthly income)
    let maxEligibleLoan = 0;
    let maxEligibleEmi = 0;
    if (dto.monthlyIncome && dto.monthlyIncome > 0) {
      const availableCapacity = (dto.monthlyIncome * 0.50) - (dto.existingEmi || 0);
      maxEligibleEmi = Math.max(0, Math.round(availableCapacity));
      if (maxEligibleEmi > 0) {
        maxEligibleLoan = Math.round((maxEligibleEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)));
      }
    }

    return {
      loanAmount: P,
      interestRate: dto.interestRate,
      tenureYears: dto.tenureYears,
      monthlyEmi: emi,
      totalInterest,
      totalAmount,
      indicativeEligibility: {
        monthlyIncome: dto.monthlyIncome || 0,
        existingEmi: dto.existingEmi || 0,
        maxEligibleEmi,
        maxEligibleLoan,
        isEligibleForRequestedAmount: dto.monthlyIncome ? maxEligibleLoan >= P : true,
      },
    };
  }

  getBankLoansComparison() {
    return [
      {
        bankName: 'HDFC Bank',
        interestRate: '8.35% p.a.',
        processingFee: '0.50% (Max ₹3,000)',
        maxLtv: '85%',
        highlights: 'Fast 48-hr in-principle sanction, zero hidden charges',
      },
      {
        bankName: 'State Bank of India (SBI)',
        interestRate: '8.40% p.a.',
        processingFee: 'Nil (Special festival offer)',
        maxLtv: '90%',
        highlights: 'Lowest interest on daily reducing balance',
      },
      {
        bankName: 'ICICI Bank',
        interestRate: '8.50% p.a.',
        processingFee: '0.50% + GST',
        maxLtv: '85%',
        highlights: 'Instant digital approval for pre-approved customers',
      },
      {
        bankName: 'Axis Bank',
        interestRate: '8.55% p.a.',
        processingFee: '₹10,000 flat',
        maxLtv: '80%',
        highlights: 'Flexible 30-year repayment options with doorstep document pickup',
      },
    ];
  }

  getRequiredDocuments(loanType: string) {
    return {
      loanType,
      salaried: [
        'Identity & Address Proof (Aadhaar & PAN Card)',
        'Latest 3 Months Salary Slips',
        'Latest 6 Months Bank Account Statements (Salary Account)',
        'Form 16 or IT Returns for last 2 assessment years',
        'Property Documents (Sale Agreement, Title Deed, Approved Layout Plan)',
      ],
      selfEmployed: [
        'Identity & Address Proof (Aadhaar & PAN Card)',
        'Business Registration / GST Certificate',
        'Audited Financial Statements & ITR for past 3 years',
        'Latest 12 Months Current & Savings Bank Statements',
        'Property Chain Documents & Mother Deed copy',
      ],
    };
  }

  async submitAssistanceRequest(dto: LoanAssistanceRequestDto, userId?: string) {
    const newRecord: HomeLoanRecord = {
      id: `loan-${Date.now()}`,
      userId,
      userName: dto.userName,
      userPhone: dto.userPhone,
      userEmail: dto.userEmail,
      loanType: dto.loanType,
      propertyCost: dto.propertyCost,
      loanAmount: dto.loanAmount,
      tenureYears: dto.tenureYears,
      monthlyIncome: dto.monthlyIncome,
      existingEmi: dto.existingEmi || 0,
      calculatedEmi: dto.calculatedEmi,
      selectedBank: dto.selectedBank,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.homeLoanRequests.unshift(newRecord);

    return {
      message: 'Home loan assistance request submitted! Seedha Properties finance team will directly contact you.',
      request: newRecord,
    };
  }

  getMyLoanRequests(phoneOrUserId: string) {
    return mockDb.homeLoanRequests.filter(
      (r) => r.userId === phoneOrUserId || r.userPhone === phoneOrUserId,
    );
  }
}
