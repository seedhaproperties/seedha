var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsGateway } from './events.gateway.js';
let EventsModule = class EventsModule {
};
EventsModule = __decorate([
    Global(),
    Module({
        imports: [
            JwtModule.register({
                secret: process.env.JWT_SECRET || 'seedha_properties_jwt_secret_2026_secure_key',
                signOptions: { expiresIn: '7d' },
            }),
        ],
        providers: [EventsGateway],
        exports: [EventsGateway],
    })
], EventsModule);
export { EventsModule };
//# sourceMappingURL=events.module.js.map