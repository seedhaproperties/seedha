var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class RegisterDeviceTokenDto {
    token;
    platform;
    userId;
}
__decorate([
    ApiProperty({
        example: 'dK8Z3J..._fcm_device_token_here',
        description: 'FCM Registration Token generated on the mobile device or web client',
    }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], RegisterDeviceTokenDto.prototype, "token", void 0);
__decorate([
    ApiProperty({
        example: 'android',
        enum: ['android', 'ios', 'web'],
        required: false,
        description: 'Operating system platform of the device',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], RegisterDeviceTokenDto.prototype, "platform", void 0);
__decorate([
    ApiProperty({
        example: 'usr_12345',
        required: false,
        description: 'Optional User ID if registering before or alongside JWT auth',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], RegisterDeviceTokenDto.prototype, "userId", void 0);
export class UnregisterDeviceTokenDto {
    token;
}
__decorate([
    ApiProperty({
        example: 'dK8Z3J..._fcm_device_token_here',
        description: 'FCM Registration Token to be unregistered upon logout',
    }),
    IsNotEmpty(),
    IsString(),
    __metadata("design:type", String)
], UnregisterDeviceTokenDto.prototype, "token", void 0);
//# sourceMappingURL=register-token.dto.js.map