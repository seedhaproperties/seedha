var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { Msg91Service } from './msg91.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Module({
        imports: [
            CloudinaryModule,
            JwtModule.register({
                secret: process.env.JWT_SECRET || 'seedha_properties_jwt_secret_2026_secure_key',
                signOptions: { expiresIn: '7d' },
            }),
        ],
        controllers: [AuthController],
        providers: [AuthService, Msg91Service, JwtAuthGuard],
        exports: [AuthService, Msg91Service, JwtModule, JwtAuthGuard],
    })
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map