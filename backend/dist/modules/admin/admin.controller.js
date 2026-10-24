var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import { AssignFieldWorkDto, RejectItemDto, LocationCheckDecisionDto, ContactOwnerDto, PrepareAgreementDto, CollectAndSendDigitalDto, } from './admin.dto.js';
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getOverview() {
        return this.adminService.getOverview();
    }
    getFlatsQueue() {
        return this.adminService.getFlatListingsQueue();
    }
    getRentQueue() {
        return this.adminService.getRentListingsQueue();
    }
    getCommercialQueue() {
        return this.adminService.getCommercialListingsQueue();
    }
    assignPropertyFieldWork(id, dto) {
        return this.adminService.assignPropertyFieldWork(id, dto);
    }
    verifyAndPublish(id) {
        return this.adminService.verifyAndPublishProperty(id);
    }
    rejectProperty(id, dto) {
        return this.adminService.rejectProperty(id, dto);
    }
    getPropertyManagementQueue() {
        return this.adminService.getPropertyManagementQueue();
    }
    checkLocation(id, dto) {
        return this.adminService.checkPropertyManagementLocation(id, dto);
    }
    contactOwner(id, dto) {
        return this.adminService.contactPropertyManagementOwner(id, dto);
    }
    getHomeLoansQueue() {
        return this.adminService.getHomeLoansQueue();
    }
    contactLoanUser(id, dto) {
        return this.adminService.contactHomeLoanUser(id, dto);
    }
    getRentalAgreementsQueue() {
        return this.adminService.getRentalAgreementsQueue();
    }
    prepareAndSendAgreement(id, dto) {
        return this.adminService.prepareAndSendAgreement(id, dto);
    }
    getOwnerBackgroundQueue() {
        return this.adminService.getOwnerBackgroundQueue();
    }
    assignOwnerBgFieldWork(id, dto) {
        return this.adminService.assignOwnerBackgroundFieldWork(id, dto);
    }
    collectAndSendDigital(id, dto) {
        return this.adminService.collectAndSendDigitalOwnerDetails(id, dto);
    }
};
__decorate([
    Get('overview'),
    ApiOperation({ summary: 'Admin overview summary with counts for all 7 review queues' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getOverview", null);
__decorate([
    Get('flats-review'),
    ApiOperation({ summary: 'Queue 1: Receive Flat/Building details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getFlatsQueue", null);
__decorate([
    Get('rent-review'),
    ApiOperation({ summary: 'Queue 2: Receive Rent details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getRentQueue", null);
__decorate([
    Get('commercial-review'),
    ApiOperation({ summary: 'Queue 3: Receive Commercial space details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCommercialQueue", null);
__decorate([
    Post('properties/:id/assign-field-work'),
    ApiOperation({ summary: 'Team can contact owner or do field work' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignFieldWorkDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "assignPropertyFieldWork", null);
__decorate([
    Post('properties/:id/verify-and-publish'),
    ApiOperation({ summary: 'After verify -> Publish the post' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "verifyAndPublish", null);
__decorate([
    Post('properties/:id/reject'),
    ApiOperation({ summary: 'Reject property listing with reasons' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RejectItemDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "rejectProperty", null);
__decorate([
    Get('property-management-review'),
    ApiOperation({ summary: 'Queue 4: Receive Property Management details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getPropertyManagementQueue", null);
__decorate([
    Post('property-management/:id/check-location'),
    ApiOperation({ summary: 'Admin checks location: If location matches vs else then send reject message' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, LocationCheckDecisionDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "checkLocation", null);
__decorate([
    Post('property-management/:id/contact-owner'),
    ApiOperation({ summary: 'If location matches -> Team can contact owner' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ContactOwnerDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "contactOwner", null);
__decorate([
    Get('home-loans-review'),
    ApiOperation({ summary: 'Queue 5: Receive Home Loan details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getHomeLoansQueue", null);
__decorate([
    Post('home-loans/:id/contact-user'),
    ApiOperation({ summary: 'Team directly contact user for Home Loan assistance' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ContactOwnerDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "contactLoanUser", null);
__decorate([
    Get('rental-agreements-review'),
    ApiOperation({ summary: 'Queue 6: Receive Rental Agreement details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getRentalAgreementsQueue", null);
__decorate([
    Post('rental-agreements/:id/prepare-and-send'),
    ApiOperation({ summary: 'Prepare documents -> Send to user' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, PrepareAgreementDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "prepareAndSendAgreement", null);
__decorate([
    Get('owner-background-review'),
    ApiOperation({ summary: 'Queue 7: Receive Owner Background details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getOwnerBackgroundQueue", null);
__decorate([
    Post('owner-background/:id/field-work'),
    ApiOperation({ summary: 'Team can contact owner or do field work also' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AssignFieldWorkDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "assignOwnerBgFieldWork", null);
__decorate([
    Post('owner-background/:id/collect-and-send-digital'),
    ApiOperation({ summary: 'Collect details -> Admin send details to user through digital' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CollectAndSendDigitalDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "collectAndSendDigital", null);
AdminController = __decorate([
    ApiTags('Admin Operations & Queues (Section 2)'),
    Controller('api/v1/admin'),
    __metadata("design:paramtypes", [AdminService])
], AdminController);
export { AdminController };
//# sourceMappingURL=admin.controller.js.map