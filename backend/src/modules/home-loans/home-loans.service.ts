import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { mockDb, HomeLoanRecord, BankLoanOfferRecord } from '../../common/mock-db.js';
import {
  CalculateLoanDto,
  LoanAssistanceRequestDto,
  CreateBankLoanOfferDto,
  UpdateBankLoanOfferDto,
} from './home-loans.dto.js';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class HomeLoansService {
  private readonly logger = new Logger(HomeLoansService.name);

  constructor(private readonly prisma: PrismaService) {}

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

  // Exact Reducing-Balance Monthly EMI Formula: [P * r * (1+r)^n] / [(1+r)^n - 1]
  calculateMonthlyEmi(principal: number, annualRate: number, tenureYears: number): number {
    if (principal <= 0 || annualRate <= 0 || tenureYears <= 0) return 0;
    const r = annualRate / 12 / 100;
    const n = tenureYears * 12;
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  }

  calculateEmiAndEligibility(dto: CalculateLoanDto) {
    const P = Number(dto.loanAmount) || 5000000;
    const annualRate = Number(dto.interestRate) || 8.4;
    const tenureYears = Number(dto.tenureYears) || 20;

    const r = annualRate / 12 / 100;
    const n = tenureYears * 12;

    const emi = this.calculateMonthlyEmi(P, annualRate, tenureYears);
    const totalAmount = emi * n;
    const totalInterest = Math.max(0, totalAmount - P);

    // Eligibility calculation (Standard FOIR at 50% of monthly income)
    let maxEligibleLoan = 0;
    let maxEligibleEmi = 0;
    const monthlyIncome = Number(dto.monthlyIncome) || 0;
    const existingEmi = Number(dto.existingEmi) || 0;

    if (monthlyIncome > 0) {
      const availableCapacity = (monthlyIncome * 0.50) - existingEmi;
      maxEligibleEmi = Math.max(0, Math.round(availableCapacity));
      if (maxEligibleEmi > 0) {
        maxEligibleLoan = Math.round((maxEligibleEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)));
      }
    }

    return {
      loanAmount: P,
      interestRate: annualRate,
      tenureYears,
      monthlyEmi: emi,
      totalInterest,
      totalAmount,
      amortizationSummary: {
        principalPercent: Math.round((P / totalAmount) * 100),
        interestPercent: Math.round((totalInterest / totalAmount) * 100),
        totalPaymentsCount: n,
      },
      indicativeEligibility: {
        monthlyIncome,
        existingEmi,
        maxEligibleEmi,
        maxEligibleLoan,
        isEligibleForRequestedAmount: monthlyIncome > 0 ? maxEligibleLoan >= P : true,
      },
      disclaimer: 'Calculations are indicative based on standard reducing balance method. Actual interest rates, processing fees and loan approval depend on bank credit policy, property valuation and CIBIL score.',
    };
  }

  // Format currency in Indian numbering format (Lakhs & Crores)
  formatMaxLoanDisplay(amount: number): string {
    if (amount >= 10000000) {
      const cr = amount / 10000000;
      return `₹${cr % 1 === 0 ? cr : cr.toFixed(1)} Cr`;
    }
    if (amount >= 100000) {
      const l = amount / 100000;
      return `₹${l % 1 === 0 ? l : l.toFixed(1)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  async getBankLoansComparison(loanAmount = 5000000, tenureYears = 20) {
    const P = Number(loanAmount) || 5000000;
    const tenure = Number(tenureYears) || 20;

    let offersList: any[] = [];

    // 1. Fetch active offers from PostgreSQL
    if (this.prisma?.isConnected) {
      try {
        const dbOffers = await this.prisma.bankLoanOffer.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        });
        if (dbOffers && dbOffers.length > 0) {
          offersList = dbOffers;
        }
      } catch (err: any) {
        this.logger.warn(`Prisma fetch bank offers notice: ${err.message}`);
      }
    }

    // 2. Fallback to in-memory store if needed
    if (!offersList.length) {
      offersList = mockDb.bankLoanOffers.filter((b) => b.isActive);
    }

    // 3. Compute dynamic EMI & total payment for each bank
    const enrichedOffers = offersList.map((b) => {
      const emi = this.calculateMonthlyEmi(P, b.interestRateMin, tenure);
      const totalRepayment = emi * tenure * 12;
      const totalInterest = Math.max(0, totalRepayment - P);

      let estimatedProcessingFee = b.processingFee;
      if (b.processingFeePercent && b.processingFeePercent > 0) {
        const calculatedFee = Math.round((P * b.processingFeePercent) / 100);
        estimatedProcessingFee = `₹${calculatedFee.toLocaleString('en-IN')} (${b.processingFee})`;
      }

      return {
        id: b.id,
        bankName: b.bankName,
        bankCode: b.bankCode,
        interestRateMin: b.interestRateMin,
        interestRateMax: b.interestRateMax,
        interestRate: `${b.interestRateMin.toFixed(2)}% p.a.`,
        monthlyEmi: emi,
        monthlyEmiFormatted: `₹${emi.toLocaleString('en-IN')}/mo`,
        totalInterest,
        totalInterestFormatted: `₹${totalInterest.toLocaleString('en-IN')}`,
        totalRepayment,
        totalRepaymentFormatted: `₹${totalRepayment.toLocaleString('en-IN')}`,
        minLoanAmount: b.minLoanAmount,
        maxLoanAmount: b.maxLoanAmount,
        maxLoan: this.formatMaxLoanDisplay(b.maxLoanAmount),
        minTenureYears: b.minTenureYears,
        maxTenureYears: b.maxTenureYears,
        processingFee: b.processingFee,
        processingFeePercent: b.processingFeePercent,
        estimatedProcessingFee,
        maxLtvRatio: b.maxLtvRatio,
        maxLtv: `${b.maxLtvRatio}%`,
        badge: b.badge,
        highlights: b.highlights,
        rateValidityDate: b.rateValidityDate || 'Valid through end of quarter',
        lastUpdatedDate: b.lastUpdatedDate || '23 Nov 2026',
        iconType: b.iconType || b.bankCode,
        iconBg: b.iconBg || '#E0F2FE',
        iconColor: b.iconColor || '#0284C7',
        isActive: b.isActive,
        sortOrder: b.sortOrder,
      };
    });

    // 4. Identify comparison leaders
    let lowestRateBank: any = null;
    let lowestEmiBank: any = null;
    let lowestFeeBank: any = null;

    if (enrichedOffers.length > 0) {
      lowestRateBank = [...enrichedOffers].sort((a, b) => a.interestRateMin - b.interestRateMin)[0]?.bankName;
      lowestEmiBank = [...enrichedOffers].sort((a, b) => a.monthlyEmi - b.monthlyEmi)[0]?.bankName;
      lowestFeeBank = [...enrichedOffers].sort((a, b) => (a.processingFeePercent || 0) - (b.processingFeePercent || 0))[0]?.bankName;
    }

    return {
      loanAmount: P,
      tenureYears: tenure,
      count: enrichedOffers.length,
      comparisonHighlights: {
        lowestInterestRate: lowestRateBank,
        lowestMonthlyEmi: lowestEmiBank,
        lowestProcessingFee: lowestFeeBank,
      },
      disclaimer: 'Rates are indicative and subject to periodic revision by lending partners. Final approval and terms are subject to borrower credit assessment, documentation and bank sanction.',
      offers: enrichedOffers,
    };
  }

  // ── Admin CRUD for Bank Loan Offers ──

  async getAllOffers(includeInactive = true) {
    if (this.prisma?.isConnected) {
      try {
        const whereClause = includeInactive ? {} : { isActive: true };
        const dbOffers = await this.prisma.bankLoanOffer.findMany({
          where: whereClause,
          orderBy: { sortOrder: 'asc' },
        });
        if (dbOffers && dbOffers.length > 0) {
          return dbOffers;
        }
      } catch (err: any) {
        this.logger.warn(`Prisma getAllOffers notice: ${err.message}`);
      }
    }
    return includeInactive
      ? mockDb.bankLoanOffers
      : mockDb.bankLoanOffers.filter((b) => b.isActive);
  }

  async createOffer(dto: CreateBankLoanOfferDto) {
    const generatedId = `offer-${Date.now()}`;
    const newOffer: BankLoanOfferRecord = {
      id: generatedId,
      bankName: dto.bankName,
      bankCode: dto.bankCode,
      interestRateMin: dto.interestRateMin,
      interestRateMax: dto.interestRateMax,
      minLoanAmount: dto.minLoanAmount || 500000,
      maxLoanAmount: dto.maxLoanAmount || 150000000,
      minTenureYears: dto.minTenureYears || 5,
      maxTenureYears: dto.maxTenureYears || 30,
      processingFee: dto.processingFee,
      processingFeePercent: dto.processingFeePercent ?? 0.35,
      maxLtvRatio: dto.maxLtvRatio || 85.0,
      badge: dto.badge,
      highlights: dto.highlights,
      rateValidityDate: dto.rateValidityDate || 'Valid through 31 Dec 2026',
      lastUpdatedDate: dto.lastUpdatedDate || new Date().toISOString().split('T')[0],
      iconType: dto.iconType || dto.bankCode,
      iconBg: dto.iconBg || '#E0F2FE',
      iconColor: dto.iconColor || '#0284C7',
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      sortOrder: dto.sortOrder || (mockDb.bankLoanOffers.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.prisma?.isConnected) {
      try {
        const created = await this.prisma.bankLoanOffer.create({
          data: {
            id: generatedId,
            bankName: newOffer.bankName,
            bankCode: newOffer.bankCode,
            interestRateMin: newOffer.interestRateMin,
            interestRateMax: newOffer.interestRateMax,
            minLoanAmount: newOffer.minLoanAmount,
            maxLoanAmount: newOffer.maxLoanAmount,
            minTenureYears: newOffer.minTenureYears,
            maxTenureYears: newOffer.maxTenureYears,
            processingFee: newOffer.processingFee,
            processingFeePercent: newOffer.processingFeePercent,
            maxLtvRatio: newOffer.maxLtvRatio,
            badge: newOffer.badge,
            highlights: newOffer.highlights,
            rateValidityDate: newOffer.rateValidityDate,
            lastUpdatedDate: newOffer.lastUpdatedDate,
            iconType: newOffer.iconType,
            iconBg: newOffer.iconBg,
            iconColor: newOffer.iconColor,
            isActive: newOffer.isActive,
            sortOrder: newOffer.sortOrder,
          },
        });
        if (created?.id) newOffer.id = created.id;
      } catch (err: any) {
        this.logger.warn(`Prisma createOffer error: ${err.message}`);
      }
    }

    mockDb.bankLoanOffers.push(newOffer);
    mockDb.saveToDisk();

    return {
      message: `Bank loan offer for ${newOffer.bankName} created successfully!`,
      offer: newOffer,
    };
  }

  async updateOffer(id: string, dto: UpdateBankLoanOfferDto) {
    let offer = mockDb.bankLoanOffers.find((b) => b.id === id);

    if (this.prisma?.isConnected) {
      try {
        await this.prisma.bankLoanOffer.updateMany({
          where: { id },
          data: {
            ...dto,
            updatedAt: new Date(),
          },
        });
      } catch (err: any) {
        this.logger.warn(`Prisma updateOffer notice: ${err.message}`);
      }
    }

    if (offer) {
      Object.assign(offer, dto);
      offer.updatedAt = new Date().toISOString();
      mockDb.saveToDisk();
    }

    return {
      message: `Bank loan offer updated successfully!`,
      offer,
    };
  }

  async toggleOfferStatus(id: string, isActive?: boolean) {
    let offer = mockDb.bankLoanOffers.find((b) => b.id === id);
    const targetStatus = isActive !== undefined ? isActive : offer ? !offer.isActive : true;

    if (this.prisma?.isConnected) {
      try {
        await this.prisma.bankLoanOffer.updateMany({
          where: { id },
          data: {
            isActive: targetStatus,
            updatedAt: new Date(),
          },
        });
      } catch (err: any) {
        this.logger.warn(`Prisma toggleOfferStatus notice: ${err.message}`);
      }
    }

    if (offer) {
      offer.isActive = targetStatus;
      offer.updatedAt = new Date().toISOString();
      mockDb.saveToDisk();
    }

    return {
      message: `Bank offer status updated to ${targetStatus ? 'Active' : 'Inactive'}`,
      id,
      isActive: targetStatus,
    };
  }

  async deleteOffer(id: string) {
    const idx = mockDb.bankLoanOffers.findIndex((b) => b.id === id);
    if (idx !== -1) {
      mockDb.bankLoanOffers.splice(idx, 1);
      mockDb.saveToDisk();
    }

    if (this.prisma?.isConnected) {
      try {
        await this.prisma.bankLoanOffer.deleteMany({ where: { id } });
      } catch (err: any) {
        this.logger.warn(`Prisma deleteOffer notice: ${err.message}`);
      }
    }

    return {
      message: `Bank loan offer ${id} removed successfully.`,
    };
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
    const generatedId = `loan-${Date.now()}`;
    const newRecord: HomeLoanRecord = {
      id: generatedId,
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

    if (this.prisma?.isConnected) {
      try {
        const created = await this.prisma.homeLoanRequest.create({
          data: {
            id: generatedId,
            userId: userId || null,
            userName: dto.userName,
            userPhone: dto.userPhone,
            userEmail: dto.userEmail || null,
            loanType: dto.loanType,
            propertyCost: dto.propertyCost,
            loanAmount: dto.loanAmount,
            tenureYears: dto.tenureYears,
            monthlyIncome: dto.monthlyIncome,
            existingEmi: dto.existingEmi || 0,
            calculatedEmi: dto.calculatedEmi,
            selectedBank: dto.selectedBank || null,
            status: 'REQUESTED',
          },
        });
        if (created?.id) newRecord.id = created.id;
      } catch (err: any) {
        this.logger.warn(`Prisma submitAssistanceRequest error: ${err.message}`);
      }
    }

    mockDb.homeLoanRequests.unshift(newRecord);
    mockDb.saveToDisk();

    return {
      message: 'Home loan assistance request submitted! Seedha Properties finance team will directly contact you.',
      request: newRecord,
    };
  }

  async getMyLoanRequests(phoneOrUserId: string) {
    if (this.prisma?.isConnected) {
      try {
        const dbList = await this.prisma.homeLoanRequest.findMany({
          where: {
            OR: [
              { userId: phoneOrUserId },
              { userPhone: phoneOrUserId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });
        if (dbList && dbList.length > 0) return dbList;
      } catch (err: any) {
        this.logger.warn(`Prisma getMyLoanRequests error: ${err.message}`);
      }
    }

    return mockDb.homeLoanRequests.filter(
      (r) => r.userId === phoneOrUserId || r.userPhone === phoneOrUserId,
    );
  }
}
