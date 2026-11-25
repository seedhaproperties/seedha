var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RentalAgreementsService_1;
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { mockDb } from '../../common/mock-db.js';
import { PrismaService } from '../../database/prisma.service.js';
let RentalAgreementsService = RentalAgreementsService_1 = class RentalAgreementsService {
    prisma;
    logger = new Logger(RentalAgreementsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateAgreementPreview(dto) {
        const lName = dto.landlordName || dto.ownerName || 'Property Owner';
        const lPhone = dto.landlordPhone || dto.ownerPhone || '+919876543210';
        const lAddress = dto.landlordAddress || dto.propertyAddress || 'Hyderabad';
        const rent = dto.monthlyRent || dto.rentAmount || 30000;
        const deposit = dto.securityDeposit || dto.depositAmount || 60000;
        const term = dto.leaseTermMonths || dto.durationMonths || 11;
        const startDate = dto.agreementStartDate || new Date().toISOString().split('T')[0];
        const previewText = `
RESIDENTIAL RENTAL AGREEMENT

This Rental Agreement is made on this ${startDate} at Hyderabad, Telangana.

BETWEEN:
Landlord: ${lName}, residing at ${lAddress}, Phone: ${lPhone} (hereinafter referred to as the 'LESSOR').

AND:
Tenant: ${dto.tenantName}, residing at ${dto.tenantAddress || dto.propertyAddress}, Phone: ${dto.tenantPhone} (hereinafter referred to as the 'LESSEE').

SUBJECT PROPERTY:
${dto.propertyAddress}

KEY TERMS & CONDITIONS:
1. TERM: The tenancy is for a duration of ${term} months commencing from ${startDate}.
2. RENT: The Lessee agrees to pay a monthly rent of ₹${rent.toLocaleString('en-IN')}/- on or before the 5th day of every calendar month.
3. SECURITY DEPOSIT: An interest-free refundable security deposit of ₹${deposit.toLocaleString('en-IN')}/- has been deposited with the Lessor.
4. NOTICE PERIOD: Either party can terminate this agreement by providing one calendar month advance written notice.
5. INSPECTION & MAINTENANCE: The Lessor or their authorized Seedha Properties representative may inspect the premises with prior notice.

IN WITNESS WHEREOF, the Lessor and Lessee have set their hands on this agreement.
    `.trim();
        return {
            templateVersion: 'SEEDHA-RENTAL-V2.1-LEGAL',
            previewContent: previewText,
            price: 599,
            currency: 'INR',
            summary: {
                landlord: lName,
                tenant: dto.tenantName,
                propertyAddress: dto.propertyAddress,
                monthlyRent: rent,
                securityDeposit: deposit,
                termMonths: term,
            },
        };
    }
    async createAndOrderAgreement(details, order, userId) {
        const lName = details.landlordName || details.ownerName || 'Property Owner';
        const lPhone = details.landlordPhone || details.ownerPhone || '+919876543210';
        const lAddress = details.landlordAddress || details.propertyAddress || 'Hyderabad';
        const tAddress = details.tenantAddress || details.propertyAddress || 'Hyderabad';
        const rent = details.monthlyRent || details.rentAmount || 30000;
        const deposit = details.securityDeposit || details.depositAmount || 60000;
        const term = details.leaseTermMonths || details.durationMonths || 11;
        const startDate = details.agreementStartDate || new Date().toISOString().split('T')[0];
        const generatedId = `agr-${Date.now()}`;
        const newOrder = {
            id: generatedId,
            userId,
            landlordName: lName,
            landlordPhone: lPhone,
            landlordEmail: details.landlordEmail,
            landlordAddress: lAddress,
            tenantName: details.tenantName,
            tenantPhone: details.tenantPhone,
            tenantEmail: details.tenantEmail,
            tenantAddress: tAddress,
            propertyAddress: details.propertyAddress,
            monthlyRent: rent,
            securityDeposit: deposit,
            leaseTermMonths: term,
            agreementStartDate: startDate,
            status: 'PAID',
            paymentAmount: order.paymentAmount || 599,
            paymentTxnId: order.paymentTxnId || `txn_ra_${Date.now()}`,
            documentUrl: `/api/v1/rental-agreements/documents/${generatedId}.pdf`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        if (this.prisma?.isConnected) {
            try {
                const created = await this.prisma.rentalAgreementOrder.create({
                    data: {
                        id: generatedId,
                        userId: userId || null,
                        landlordName: lName,
                        landlordPhone: lPhone,
                        landlordEmail: details.landlordEmail || null,
                        landlordAddress: lAddress,
                        tenantName: details.tenantName,
                        tenantPhone: details.tenantPhone,
                        tenantEmail: details.tenantEmail || null,
                        tenantAddress: tAddress,
                        propertyAddress: details.propertyAddress,
                        monthlyRent: rent,
                        securityDeposit: deposit,
                        leaseTermMonths: term,
                        agreementStartDate: startDate,
                        status: 'PAID',
                        paymentAmount: order.paymentAmount || 599,
                        paymentTxnId: order.paymentTxnId || null,
                        documentUrl: newOrder.documentUrl,
                    },
                });
                if (created?.id)
                    newOrder.id = created.id;
            }
            catch (err) {
                this.logger.warn(`Prisma RentalAgreement create error: ${err.message}`);
            }
        }
        mockDb.rentalAgreementOrders.unshift(newOrder);
        return {
            message: 'Payment received successfully! Rental agreement order placed. Admin team is preparing the executed stamp documents.',
            order: newOrder,
        };
    }
    async getMyAgreements(phoneOrUserId) {
        if (this.prisma?.isConnected) {
            try {
                const dbList = await this.prisma.rentalAgreementOrder.findMany({
                    where: {
                        OR: [
                            { userId: phoneOrUserId },
                            { tenantPhone: phoneOrUserId },
                            { landlordPhone: phoneOrUserId },
                        ],
                    },
                    orderBy: { createdAt: 'desc' },
                });
                if (dbList && dbList.length > 0)
                    return dbList;
            }
            catch (err) {
                this.logger.warn(`Prisma RentalAgreement getMyAgreements error: ${err.message}`);
            }
        }
        return mockDb.rentalAgreementOrders.filter((a) => a.userId === phoneOrUserId ||
            a.tenantPhone === phoneOrUserId ||
            a.landlordPhone === phoneOrUserId);
    }
    async findOne(id) {
        if (this.prisma?.isConnected) {
            try {
                const dbAgr = await this.prisma.rentalAgreementOrder.findUnique({
                    where: { id },
                });
                if (dbAgr)
                    return dbAgr;
            }
            catch (err) {
                this.logger.warn(`Prisma RentalAgreement findOne error: ${err.message}`);
            }
        }
        const agr = mockDb.rentalAgreementOrders.find((a) => a.id === id);
        if (!agr) {
            throw new NotFoundException(`Rental agreement order ${id} not found`);
        }
        return agr;
    }
};
RentalAgreementsService = RentalAgreementsService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], RentalAgreementsService);
export { RentalAgreementsService };
//# sourceMappingURL=rental-agreements.service.js.map