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
import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
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
    getAllRequests(module, status, search) {
        return this.adminService.getAllUnifiedRequests({ module, status, search });
    }
    getRequestById(id) {
        return this.adminService.getUnifiedRequestById(id);
    }
    getTeam() {
        return this.adminService.getTeamMembers();
    }
    addTeamMember(body) {
        return this.adminService.addTeamMember(body);
    }
    getListings() {
        return this.adminService.getLiveListings();
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
    getPgQueue() {
        return this.adminService.getPgListingsQueue();
    }
    assignPropertyFieldWork(id, dto) {
        return this.adminService.assignPropertyFieldWork(id, dto);
    }
    verifyAndPublish(id) {
        return this.adminService.verifyAndPublishProperty(id);
    }
    approveProperty(id) {
        return this.adminService.approveProperty(id);
    }
    rejectProperty(id, dto) {
        return this.adminService.rejectProperty(id, dto);
    }
    unpublishProperty(id, note) {
        return this.adminService.unpublishProperty(id, note);
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
    getLoanOffers(includeInactive) {
        return this.adminService.getAllLoanOffers(includeInactive !== 'false');
    }
    createLoanOffer(dto) {
        return this.adminService.createLoanOffer(dto);
    }
    updateLoanOffer(id, dto) {
        return this.adminService.updateLoanOffer(id, dto);
    }
    toggleLoanOffer(id, isActive) {
        return this.adminService.toggleLoanOffer(id, isActive);
    }
    deleteLoanOffer(id) {
        return this.adminService.deleteLoanOffer(id);
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
    getUsers() {
        return this.adminService.getUsers();
    }
    deleteProperty(id) {
        return this.adminService.deleteProperty(id);
    }
    getReports() {
        return this.adminService.getReports();
    }
    getNotifications() {
        return this.adminService.getNotifications();
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
    Get('requests'),
    ApiOperation({ summary: 'Get unified requests across all 7 business modules' }),
    __param(0, Query('module')),
    __param(1, Query('status')),
    __param(2, Query('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllRequests", null);
__decorate([
    Get('requests/:id'),
    ApiOperation({ summary: 'Get single unified request details across any of the 7 modules' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getRequestById", null);
__decorate([
    Get('team'),
    ApiOperation({ summary: 'Get active operations team members' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTeam", null);
__decorate([
    Post('team'),
    ApiOperation({ summary: 'Add a new operations team member' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "addTeamMember", null);
__decorate([
    Get('listings'),
    ApiOperation({ summary: 'Get published live listings on Seedha portal' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getListings", null);
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
    Get('pg-review'),
    ApiOperation({ summary: 'Receive PG & Hostel details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getPgQueue", null);
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
    Post(['properties/:id/approve', 'requests/:id/approve']),
    ApiOperation({ summary: 'Approve and publish property listing or service request' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveProperty", null);
__decorate([
    Post(['properties/:id/reject', 'requests/:id/reject']),
    ApiOperation({ summary: 'Reject property listing or service request with reasons' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RejectItemDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "rejectProperty", null);
__decorate([
    Post(['properties/:id/unpublish', 'requests/:id/unpublish']),
    ApiOperation({ summary: 'Unpublish property listing back to pending review' }),
    __param(0, Param('id')),
    __param(1, Body('note')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "unpublishProperty", null);
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
    Get('loan-offers'),
    ApiOperation({ summary: 'Admin: Get all bank loan offers' }),
    __param(0, Query('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getLoanOffers", null);
__decorate([
    Post('loan-offers'),
    ApiOperation({ summary: 'Admin: Create new bank loan offer' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createLoanOffer", null);
__decorate([
    Put('loan-offers/:id'),
    ApiOperation({ summary: 'Admin: Update bank loan offer' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateLoanOffer", null);
__decorate([
    Patch('loan-offers/:id/toggle'),
    ApiOperation({ summary: 'Admin: Toggle bank loan offer active state' }),
    __param(0, Param('id')),
    __param(1, Body('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleLoanOffer", null);
__decorate([
    Delete('loan-offers/:id'),
    ApiOperation({ summary: 'Admin: Delete bank loan offer' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteLoanOffer", null);
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
__decorate([
    Get('users'),
    ApiOperation({ summary: 'Get all registered users in database' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    Delete('properties/:id'),
    ApiOperation({ summary: 'Delete property permanently from database' }),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteProperty", null);
__decorate([
    Get('reports'),
    ApiOperation({ summary: 'Get real audit logs and platform summary reports' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getReports", null);
__decorate([
    Get('notifications'),
    ApiOperation({ summary: 'Get real administrative notifications and alerts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getNotifications", null);
AdminController = __decorate([
    ApiTags('Admin Operations & Queues (Section 2)'),
    Controller(['api/v1/admin', 'admin']),
    __metadata("design:paramtypes", [AdminService])
], AdminController);
export { AdminController };
//# sourceMappingURL=admin.controller.js.map