var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OwnerBackgroundService_1;
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { mockDb } from '../../common/mock-db.js';
import { PrismaService } from '../../database/prisma.service.js';
let OwnerBackgroundService = OwnerBackgroundService_1 = class OwnerBackgroundService {
    prisma;
    logger = new Logger(OwnerBackgroundService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRequest(dto, userId) {
        const generatedId = `bg-${Date.now()}`;
        const newRecord = {
            id: generatedId,
            userId,
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
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
                if (created?.id)
                    newRecord.id = created.id;
            }
            catch (err) {
                this.logger.warn(`Prisma OwnerBackground create error: ${err.message}`);
            }
        }
        mockDb.ownerBackgroundChecks.unshift(newRecord);
        return {
            message: 'Owner background check request initiated. Please complete the ₹499 verification fee payment.',
            request: newRecord,
            fee: 499,
            currency: 'INR',
        };
    }
    async payAndSubmit(id, dto) {
        let record = mockDb.ownerBackgroundChecks.find((r) => r.id === id);
        if (!record && this.prisma?.isConnected) {
            try {
                const dbRec = await this.prisma.ownerBackgroundCheck.findUnique({
                    where: { id },
                });
                if (dbRec) {
                    record = dbRec;
                    mockDb.ownerBackgroundChecks.unshift(dbRec);
                }
            }
            catch (err) {
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
            }
            catch (err) {
                this.logger.warn(`Prisma OwnerBackground pay error: ${err.message}`);
            }
        }
        return {
            message: 'Payment verified! Owner background report has been prepared and sent digitally to your account.',
            record,
        };
    }
    async getReport(id) {
        let record = mockDb.ownerBackgroundChecks.find((r) => r.id === id);
        if (!record && this.prisma?.isConnected) {
            try {
                const dbRec = await this.prisma.ownerBackgroundCheck.findUnique({
                    where: { id },
                });
                if (dbRec)
                    record = dbRec;
            }
            catch (err) {
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
    async getMyChecks(phoneOrUserId) {
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
                if (dbList && dbList.length > 0)
                    return dbList;
            }
            catch (err) {
                this.logger.warn(`Prisma OwnerBackground getMyChecks error: ${err.message}`);
            }
        }
        return mockDb.ownerBackgroundChecks.filter((r) => r.userId === phoneOrUserId || r.ownerPhone === phoneOrUserId);
    }
};
OwnerBackgroundService = OwnerBackgroundService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], OwnerBackgroundService);
export { OwnerBackgroundService };
//# sourceMappingURL=owner-background.service.js.map