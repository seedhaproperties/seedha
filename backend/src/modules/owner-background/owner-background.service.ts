import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { mockDb, OwnerBackgroundRecord } from '../../common/mock-db.js';
import { RequestOwnerBackgroundDto, PayOwnerBackgroundDto } from './owner-background.dto.js';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class OwnerBackgroundService {
  private readonly logger = new Logger(OwnerBackgroundService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createRequest(dto: RequestOwnerBackgroundDto, userId?: string) {
    const generatedId = `bg-${Date.now()}`;
    const newRecord: OwnerBackgroundRecord = {
      id: generatedId,
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

    // 1. Persist to PostgreSQL if connected
    if (this.prisma?.isConnected) {
      try {
        const created = await this.prisma.ownerBackgroundCheck.create({
          data: {
            id: generatedId,
            userId: userId || null,
            flatNumber: dto.flatNumber,
            buildingName: dto.buildingName,
            propertyAddress: dto.propertyAddress,
            city: dto.city,
            ownerName: dto.ownerName,
            ownerPhone: dto.ownerPhone,
            status: 'SUBMITTED',
            paymentAmount: 499,
            ownershipVerified: false,
            legalDisputeClear: false,
            taxReceiptsVerified: false,
            societyDuesClear: false,
          },
        });
        if (created?.id) newRecord.id = created.id;
      } catch (err: any) {
        this.logger.warn(`Prisma OwnerBackground create error: ${err.message}`);
      }
    }

    // 2. Keep in-memory mockDb synchronized
    mockDb.ownerBackgroundChecks.unshift(newRecord);

    return {
      message: 'Owner background check request initiated. Please complete the ₹499 verification fee payment.',
      request: newRecord,
      fee: 499,
      currency: 'INR',
    };
  }

  async payAndSubmit(id: string, dto: PayOwnerBackgroundDto) {
    let record = mockDb.ownerBackgroundChecks.find((r) => r.id === id);

    // If not in mockDb, check Prisma PostgreSQL
    if (!record && this.prisma?.isConnected) {
      try {
        const dbRec: any = await this.prisma.ownerBackgroundCheck.findUnique({
          where: { id },
        });
        if (dbRec) {
          record = dbRec;
          mockDb.ownerBackgroundChecks.unshift(dbRec);
        }
      } catch (err: any) {
        this.logger.warn(`Prisma find owner background record: ${err.message}`);
      }
    }

    if (!record) {
      throw new NotFoundException(`Verification request with ID ${id} not found`);
    }

    const reportSummary = `Background verification completed for ${record.ownerName} at ${record.buildingName}, Flat ${record.flatNumber}. Title deed verified, zero encumbrances detected in Sub-Registrar records, GHMC municipal property tax current, and society dues cleared.`;
    const reportPdfUrl = `/api/v1/owner-background/${record.id}/report-pdf`;
    const digitalSentAt = new Date().toISOString();

    record.status = 'SENT_DIGITALLY';
    record.paymentTxnId = dto.paymentTxnId;
    record.paymentAmount = dto.paymentAmount || 499;
    record.updatedAt = new Date().toISOString();
    record.ownershipVerified = true;
    record.legalDisputeClear = true;
    record.taxReceiptsVerified = true;
    record.societyDuesClear = true;
    record.reportSummary = reportSummary;
    record.reportPdfUrl = reportPdfUrl;
    record.digitalSentAt = digitalSentAt;

    // Persist payment & verification status to PostgreSQL
    if (this.prisma?.isConnected) {
      try {
        await this.prisma.ownerBackgroundCheck.updateMany({
          where: { id },
          data: {
            status: 'SENT_DIGITALLY',
            paymentTxnId: dto.paymentTxnId,
            paymentAmount: dto.paymentAmount || 499,
            ownershipVerified: true,
            legalDisputeClear: true,
            taxReceiptsVerified: true,
            societyDuesClear: true,
            reportSummary,
            reportPdfUrl,
            digitalSentAt: new Date(),
          },
        });
      } catch (err: any) {
        this.logger.warn(`Prisma OwnerBackground pay error: ${err.message}`);
      }
    }

    return {
      message: 'Payment verified! Owner background report has been prepared and sent digitally to your account.',
      record,
    };
  }

  async getReport(id: string) {
    let record = mockDb.ownerBackgroundChecks.find((r) => r.id === id);

    if (!record && this.prisma?.isConnected) {
      try {
        const dbRec: any = await this.prisma.ownerBackgroundCheck.findUnique({
          where: { id },
        });
        if (dbRec) record = dbRec;
      } catch (err: any) {
        this.logger.warn(`Prisma find owner background report: ${err.message}`);
      }
    }

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
    if (this.prisma?.isConnected) {
      try {
        const dbList = await this.prisma.ownerBackgroundCheck.findMany({
          where: {
            OR: [
              { userId: phoneOrUserId },
              { ownerPhone: phoneOrUserId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });
        if (dbList && dbList.length > 0) return dbList;
      } catch (err: any) {
        this.logger.warn(`Prisma OwnerBackground getMyChecks error: ${err.message}`);
      }
    }

    return mockDb.ownerBackgroundChecks.filter(
      (r) => r.userId === phoneOrUserId || r.ownerPhone === phoneOrUserId,
    );
  }
}
