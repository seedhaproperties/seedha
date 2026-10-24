import { Injectable, NotFoundException } from '@nestjs/common';
import { mockDb, OwnerBackgroundRecord } from '../../common/mock-db.js';
import { RequestOwnerBackgroundDto, PayOwnerBackgroundDto } from './owner-background.dto.js';

@Injectable()
export class OwnerBackgroundService {
  async createRequest(dto: RequestOwnerBackgroundDto, userId?: string) {
    const newRecord: OwnerBackgroundRecord = {
      id: `bg-${Date.now()}`,
      userId,
      flatNumber: dto.flatNumber,
      buildingName: dto.buildingName,
      propertyAddress: dto.propertyAddress,
      city: dto.city,
      ownerName: dto.ownerName,
      ownerPhone: dto.ownerPhone,
      status: 'SUBMITTED', // Needs payment to progress
      paymentAmount: 499,
      ownershipVerified: false,
      legalDisputeClear: false,
      taxReceiptsVerified: false,
      societyDuesClear: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.ownerBackgroundChecks.unshift(newRecord);

    return {
      message: 'Owner background check request initiated. Please complete the ₹499 verification fee payment.',
      request: newRecord,
      fee: 499,
      currency: 'INR',
    };
  }

  async payAndSubmit(id: string, dto: PayOwnerBackgroundDto) {
    const record = mockDb.ownerBackgroundChecks.find((r) => r.id === id);
    if (!record) {
      throw new NotFoundException(`Verification request with ID ${id} not found`);
    }

    record.status = 'PAID';
    record.paymentTxnId = dto.paymentTxnId;
    record.paymentAmount = dto.paymentAmount;
    record.updatedAt = new Date().toISOString();

    // Auto-populate preliminary verified parameters for demonstration/development instant access
    record.ownershipVerified = true;
    record.legalDisputeClear = true;
    record.taxReceiptsVerified = true;
    record.societyDuesClear = true;
    record.reportSummary = `Background verification completed for ${record.ownerName} at ${record.buildingName}, Flat ${record.flatNumber}. Title deed verified, zero encumbrances detected in Sub-Registrar records, GHMC municipal property tax current, and society dues cleared.`;
    record.reportPdfUrl = `/api/v1/owner-background/${record.id}/report-pdf`;
    record.status = 'SENT_DIGITALLY';
    record.digitalSentAt = new Date().toISOString();

    return {
      message: 'Payment verified! Owner background report has been prepared and sent digitally to your account.',
      record,
    };
  }

  async getReport(id: string) {
    const record = mockDb.ownerBackgroundChecks.find((r) => r.id === id);
    if (!record) {
      throw new NotFoundException(`Verification record ${id} not found`);
    }

    return {
      id: record.id,
      flatNumber: record.flatNumber,
      buildingName: record.buildingName,
      propertyAddress: record.propertyAddress,
      city: record.city,
      ownerName: record.ownerName,
      ownerPhone: record.ownerPhone,
      status: record.status,
      verificationChecklist: {
        ownershipTitleDeed: record.ownershipVerified ? 'VERIFIED' : 'PENDING',
        encumbranceCertificateEC: record.legalDisputeClear ? 'CLEAR (No Liens Found)' : 'PENDING',
        municipalTaxReceipts: record.taxReceiptsVerified ? 'UP TO DATE' : 'PENDING',
        societyMaintenanceDues: record.societyDuesClear ? 'NO DUES PENDING' : 'PENDING',
      },
      reportSummary: record.reportSummary,
      downloadPdfUrl: record.reportPdfUrl,
      digitalSentAt: record.digitalSentAt,
    };
  }

  async getMyChecks(phoneOrUserId: string) {
    return mockDb.ownerBackgroundChecks.filter(
      (r) => r.userId === phoneOrUserId || r.ownerPhone === phoneOrUserId,
    );
  }
}
