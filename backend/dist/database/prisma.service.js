var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaService_1;
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
let PrismaService = PrismaService_1 = class PrismaService extends PrismaClient {
    logger = new Logger(PrismaService_1.name);
    isConnected = false;
    async onModuleInit() {
        try {
            const connectPromise = this.$connect().then(() => this.$queryRaw `SELECT 1`);
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('PostgreSQL ping timeout (1500ms)')), 1500));
            await Promise.race([connectPromise, timeoutPromise]);
            this.isConnected = true;
            this.logger.log('Successfully connected to PostgreSQL via Prisma');
        }
        catch (error) {
            this.isConnected = false;
            const isProd = (process.env.NODE_ENV || '').trim().toLowerCase() === 'production';
            if (isProd) {
                this.logger.error(`FATAL: PostgreSQL connection failed at DATABASE_URL in PRODUCTION mode: ${error.message}. Silent local JSON fallback is strictly disabled in production.`);
                throw new Error(`Production Database Connection Error: Cannot start application without a reachable PostgreSQL database at DATABASE_URL. Silent local JSON fallback is strictly disabled in production.`);
            }
            this.logger.warn(`[DEVELOPMENT ONLY] PostgreSQL not reachable directly at DATABASE_URL (${error.message}). Local persistent storage will be utilized in development mode so offline workflows remain functional.`);
        }
    }
    async onModuleDestroy() {
        if (this.isConnected) {
            await this.$disconnect();
        }
    }
};
PrismaService = PrismaService_1 = __decorate([
    Injectable()
], PrismaService);
export { PrismaService };
//# sourceMappingURL=prisma.service.js.map