import { Injectable, NotFoundException } from '@nestjs/common';
import { mockDb, RentalAgreementRecord } from '../../common/mock-db.js';
import { RentalAgreementDetailsDto, OrderAgreementDto } from './rental-agreements.dto.js';

@Injectable()
export class RentalAgreementsService {
  generateAgreementPreview(dto: RentalAgreementDetailsDto) {
    const previewText = `
RESIDENTIAL RENTAL AGREEMENT

This Rental Agreement is made on this ${dto.agreementStartDate} at Hyderabad, Telangana.

BETWEEN:
Landlord: ${dto.landlordName}, residing at ${dto.landlordAddress}, Phone: ${dto.landlordPhone} (hereinafter referred to as the 'LESSOR').

AND:
Tenant: ${dto.tenantName}, residing at ${dto.tenantAddress}, Phone: ${dto.tenantPhone} (hereinafter referred to as the 'LESSEE').

SUBJECT PROPERTY:
${dto.propertyAddress}

KEY TERMS & CONDITIONS:
1. TERM: The tenancy is for a duration of ${dto.leaseTermMonths} months commencing from ${dto.agreementStartDate}.
2. RENT: The Lessee agrees to pay a monthly rent of ₹${dto.monthlyRent.toLocaleString('en-IN')}/- on or before the 5th day of every calendar month.
3. SECURITY DEPOSIT: An interest-free refundable security deposit of ₹${dto.securityDeposit.toLocaleString('en-IN')}/- has been deposited with the Lessor.
4. NOTICE PERIOD: Either party can terminate this agreement by providing one calendar month advance written notice.
5. INSPECTION & MAINTENANCE: The Lessor or their authorized Seedha Properties representative may inspect the premises with prior notice.

IN WITNESS WHEREOF, the Lessor and Lessee have set their hands on this agreement.
    `.trim();

    return {
      templateVersion: 'SEEDHA-RENTAL-V2.1-LEGAL',
      previewContent: previewText,
      price: 999,
      currency: 'INR',
      summary: {
        landlord: dto.landlordName,
        tenant: dto.tenantName,
        propertyAddress: dto.propertyAddress,
        monthlyRent: dto.monthlyRent,
        securityDeposit: dto.securityDeposit,
        termMonths: dto.leaseTermMonths,
      },
    };
  }

  async createAndOrderAgreement(
    details: RentalAgreementDetailsDto,
    order: OrderAgreementDto,
    userId?: string,
  ) {
    const newOrder: RentalAgreementRecord = {
      id: `agr-${Date.now()}`,
      userId,
      landlordName: details.landlordName,
      landlordPhone: details.landlordPhone,
      landlordEmail: details.landlordEmail,
      landlordAddress: details.landlordAddress,
      tenantName: details.tenantName,
      tenantPhone: details.tenantPhone,
      tenantEmail: details.tenantEmail,
      tenantAddress: details.tenantAddress,
      propertyAddress: details.propertyAddress,
      monthlyRent: details.monthlyRent,
      securityDeposit: details.securityDeposit,
      leaseTermMonths: details.leaseTermMonths,
      agreementStartDate: details.agreementStartDate,
      status: 'PAID', // Payment verified, sent to Admin for document preparation
      paymentAmount: order.paymentAmount,
      paymentTxnId: order.paymentTxnId,
      documentUrl: `/api/v1/rental-agreements/documents/agr-${Date.now()}.pdf`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.rentalAgreementOrders.unshift(newOrder);

    return {
      message: 'Payment of ₹999 received successfully! Rental agreement order placed. Admin team is preparing the executed stamp documents.',
      order: newOrder,
    };
  }

  async getMyAgreements(phoneOrUserId: string) {
    return mockDb.rentalAgreementOrders.filter(
      (a) =>
        a.userId === phoneOrUserId ||
        a.tenantPhone === phoneOrUserId ||
        a.landlordPhone === phoneOrUserId,
    );
  }

  async findOne(id: string) {
    const agr = mockDb.rentalAgreementOrders.find((a) => a.id === id);
    if (!agr) {
      throw new NotFoundException(`Rental agreement order ${id} not found`);
    }
    return agr;
  }
}
