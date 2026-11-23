import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isConnected = false;

  async onModuleInit() {
    try {
      const connectPromise = this.$connect().then(() => this.$queryRaw`SELECT 1`);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('PostgreSQL ping timeout (1500ms)')), 1500),
      );
      await Promise.race([connectPromise, timeoutPromise]);
      this.isConnected = true;
      this.logger.log('Successfully connected to PostgreSQL via Prisma');
    } catch (error) {
      this.isConnected = false;
      const isProd =
        (process.env.NODE_ENV || '').trim().toLowerCase() === 'production';
      if (isProd) {
        this.logger.error(
          `FATAL: PostgreSQL connection failed at DATABASE_URL in PRODUCTION mode: ${(error as Error).message}. Silent local JSON fallback is strictly disabled in production.`,
        );
        throw new Error(
          `Production Database Connection Error: Cannot start application without a reachable PostgreSQL database at DATABASE_URL. Silent local JSON fallback is strictly disabled in production.`,
        );
      }
      this.logger.warn(
        `[DEVELOPMENT ONLY] PostgreSQL not reachable directly at DATABASE_URL (${(error as Error).message}). Local persistent storage will be utilized in development mode so offline workflows remain functional.`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
    }
  }
}
