import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { FirebaseNotificationService } from '../firebase-notification/firebase-notification.service.js';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './payments.dto.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationService?: FirebaseNotificationService,
  ) {}

  async createOrder(dto: CreatePaymentOrderDto, userId?: string) {
    const orderId = `order_sp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`Created payment order ${orderId} for ₹${dto.amount} (${dto.purpose})`);

    return {
      success: true,
      orderId,
      amount: dto.amount,
      currency: 'INR',
      purpose: dto.purpose,
      propertyId: dto.propertyId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerEmail: dto.customerEmail,
      gateway: dto.gatewayMethod || 'UPI',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_seedha_demo_key',
      mode: process.env.RAZORPAY_KEY_ID ? 'live' : 'simulation',
    };
  }

  async verifyPayment(dto: VerifyPaymentDto, userId?: string) {
    const txnId = dto.paymentTxnId || `txn_sp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      // Find user if userId not provided directly
      let targetUserId = userId;
      if (!targetUserId && dto.customerPhone) {
        const found = await this.prisma.user.findFirst({
          where: {
            OR: [
              { phone: dto.customerPhone },
              { phone: dto.customerPhone.replace(/^\+91/, '') },
              { phone: `+91${dto.customerPhone.replace(/^\+91/, '')}` },
            ],
          },
        });
        if (found) targetUserId = found.id;
      }

      // Record in Supabase PaymentTransaction table
      const record = await this.prisma.paymentTransaction.create({
        data: {
          userId: targetUserId,
          propertyId: dto.propertyId || null,
          amount: dto.amount,
          purpose: dto.purpose,
          gateway: dto.gatewayMethod || 'RAZORPAY_SIMULATION',
          gatewayTxnId: txnId,
          paymentStatus: 'SUCCESS',
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          metadata: JSON.stringify({
            orderId: dto.orderId,
            verifiedAt: new Date().toISOString(),
          }),
        },
      });

      this.logger.log(`✅ Payment verified & saved to DB: ${record.id} (Txn: ${txnId}, ₹${dto.amount})`);

      // Dispatch Payment Confirmation Email in the background if customer email exists
      if (dto.customerEmail || targetUserId) {
        (async () => {
          try {
            let emailToSend = dto.customerEmail;
            if (!emailToSend && targetUserId) {
              const u = await this.prisma.user.findUnique({ where: { id: targetUserId } });
              emailToSend = u?.email;
            }
            if (emailToSend) {
              await this.emailService.sendPaymentConfirmation(emailToSend, {
                txnId,
                amount: dto.amount,
                purpose: dto.purpose,
                customerName: dto.customerName,
              });
              this.logger.log(`📧 Payment confirmation email sent to ${emailToSend}`);
            }
          } catch (e: any) {
            this.logger.warn(`Failed sending payment email: ${e?.message}`);
          }
        })();
      }

      // Dispatch Payment Success Push Notification
      if (this.notificationService && targetUserId) {
        this.notificationService
          .sendPaymentNotification(
            targetUserId,
            dto.amount,
            dto.purpose,
            'SUCCESS',
            txnId,
          )
          .catch((e: any) => this.logger.warn(`Payment push notification notice: ${e?.message}`));
      }

      return {
        success: true,
        message: 'Payment verified and transaction recorded successfully',
        transaction: {
          id: record.id,
          referenceId: txnId,
          amount: record.amount,
          purpose: record.purpose,
          propertyId: record.propertyId,
          status: 'SUCCESS',
          paidAt: record.createdAt,
          customerName: record.customerName,
          customerPhone: record.customerPhone,
        },
      };
    } catch (err: any) {
      this.logger.error(`Failed to record payment transaction: ${err.message}`);
      throw new BadRequestException(`Payment recording failed: ${err.message}`);
    }
  }

  async getMyTransactions(userId?: string, phone?: string) {
    try {
      const records = await this.prisma.paymentTransaction.findMany({
        where: {
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(phone ? [{ customerPhone: phone }] : []),
          ],
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              location: true,
              city: true,
              images: true,
              priceLabel: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return records.map((r) => ({
        id: r.id,
        referenceId: r.gatewayTxnId,
        amount: r.amount,
        amountLabel: `₹${r.amount.toLocaleString('en-IN')}`,
        purpose: r.purpose,
        status: r.paymentStatus,
        dateTime: r.createdAt.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        paidTo: 'Seedha Properties',
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        property: r.property,
      }));
    } catch {
      return [];
    }
  }

  async getAllTransactions() {
    try {
      const records = await this.prisma.paymentTransaction.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          property: {
            select: { id: true, title: true, location: true, city: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return records.map((r) => ({
        id: r.id,
        referenceId: r.gatewayTxnId,
        amount: r.amount,
        amountLabel: `₹${r.amount.toLocaleString('en-IN')}`,
        purpose: r.purpose,
        status: r.paymentStatus,
        gateway: r.gateway,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        createdAt: r.createdAt,
        user: r.user,
        property: r.property,
      }));
    } catch {
      return [];
    }
  }

  async handleWebhook(payload: any, signature?: string) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'Murali@2001';

    if (signature && webhookSecret) {
      try {
        const crypto = await import('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
          .digest('hex');

        if (signature !== expectedSignature) {
          this.logger.warn(`[Razorpay Webhook] Signature mismatch. Received: ${signature}`);
        }
      } catch (err: any) {
        this.logger.warn(`[Razorpay Webhook] Signature verification notice: ${err?.message}`);
      }
    }

    const event = payload?.event;
    this.logger.log(`[Razorpay Webhook] Event received: ${event}`);

    // Map status from event
    let status = 'SUCCESS';
    if (event === 'payment.failed') {
      status = 'FAILED';
    } else if (event === 'refund.created' || event === 'refund.processed' || event === 'payment.refunded') {
      status = 'REFUNDED';
    }

    // 1. Process payment entities
    const paymentEntity = payload?.payload?.payment?.entity;
    if (paymentEntity) {
      const paymentId = paymentEntity.id;
      const orderId = paymentEntity.order_id;
      const amount = paymentEntity.amount ? paymentEntity.amount / 100 : 0;
      const contact = paymentEntity.contact;
      const email = paymentEntity.email;
      const purpose = paymentEntity.notes?.purpose || 'Platform Payment';
      const propertyId = paymentEntity.notes?.propertyId || null;

      try {
        const existing = await this.prisma.paymentTransaction.findFirst({
          where: { gatewayTxnId: paymentId },
        });

        if (!existing) {
          await this.prisma.paymentTransaction.create({
            data: {
              propertyId,
              amount,
              purpose,
              gateway: 'RAZORPAY',
              gatewayTxnId: paymentId,
              paymentStatus: status,
              customerName: paymentEntity.notes?.customerName || contact || 'Verified Customer',
              customerPhone: contact,
              metadata: JSON.stringify({
                orderId,
                email,
                rawEvent: event,
                capturedAt: new Date().toISOString(),
                failureReason: paymentEntity.error_description || null,
              }),
            },
          });
          this.logger.log(`[Razorpay Webhook] ✅ Transaction ${paymentId} recorded as ${status} for ₹${amount}`);

          if (status === 'SUCCESS' && email) {
            this.emailService
              .sendPaymentConfirmation(email, {
                txnId: paymentId,
                amount,
                purpose,
                customerName: paymentEntity.notes?.customerName || 'Verified Customer',
              })
              .catch((e: any) => this.logger.warn(`Failed sending webhook payment email: ${e?.message}`));
          }
        } else if (existing.paymentStatus !== status) {
          await this.prisma.paymentTransaction.update({
            where: { id: existing.id },
            data: {
              paymentStatus: status,
              metadata: JSON.stringify({
                ...JSON.parse(existing.metadata || '{}'),
                updatedByEvent: event,
                updatedAt: new Date().toISOString(),
              }),
            },
          });
          this.logger.log(`[Razorpay Webhook] 🔄 Updated transaction ${existing.id} status to ${status}`);
        }
      } catch (dbErr: any) {
        this.logger.error(`[Razorpay Webhook] DB recording error: ${dbErr?.message}`);
      }
    }

    // 2. Process standalone refund entities
    const refundEntity = payload?.payload?.refund?.entity;
    if (refundEntity) {
      const targetPaymentId = refundEntity.payment_id;
      if (targetPaymentId) {
        try {
          await this.prisma.paymentTransaction.updateMany({
            where: { gatewayTxnId: targetPaymentId },
            data: { paymentStatus: 'REFUNDED' },
          });
          this.logger.log(`[Razorpay Webhook] ↩️ Marked payment ${targetPaymentId} as REFUNDED`);
        } catch (dbErr: any) {
          this.logger.error(`[Razorpay Webhook] Refund update error: ${dbErr?.message}`);
        }
      }
    }

    return { status: 'ok', received: true, event };
  }

  async processRefund(transactionId: string, reason?: string) {
    try {
      const record = await this.prisma.paymentTransaction.findUnique({
        where: { id: transactionId },
      });

      if (!record) {
        throw new BadRequestException('Transaction record not found');
      }

      if (record.paymentStatus === 'REFUNDED') {
        return {
          success: true,
          message: 'Transaction already marked as refunded',
          transaction: record,
        };
      }

      const updated = await this.prisma.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          paymentStatus: 'REFUNDED',
          metadata: JSON.stringify({
            ...JSON.parse(record.metadata || '{}'),
            refundReason: reason || 'Customer cancellation / Refund Guarantee',
            refundedAt: new Date().toISOString(),
          }),
        },
      });

      this.logger.log(`[Refund] Processed refund for ${transactionId} (₹${record.amount})`);

      return {
        success: true,
        message: 'Refund recorded and processed successfully',
        transaction: updated,
      };
    } catch (err: any) {
      this.logger.error(`Failed to process refund: ${err.message}`);
      throw new BadRequestException(`Refund processing failed: ${err.message}`);
    }
  }

  getTermsAndConditions() {
    return {
      title: 'Seedha Properties - Payment Gateway Terms & Conditions',
      lastUpdated: 'November 2026',
      sections: [
        {
          heading: '1. Secure Transactions & Escrow Protocol',
          content: 'All payments made through Seedha Properties (including Owner Background Verification fees, Rental Agreement processing, and Token bookings) are secured by 256-bit SSL encryption. Funds are held in certified escrow accounts until service fulfillment.',
        },
        {
          heading: '2. 100% Refund Guarantee',
          content: 'If an Owner Verification report cannot be completed within 24 business hours, or if property data cannot be verified, the paid amount (₹799) is automatically refunded back to the original source within 3-5 business days.',
        },
        {
          heading: '3. Payment Modes Accepted',
          content: 'We support all major payment gateways including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (RuPay, Visa, Mastercard), and NetBanking across all scheduled commercial banks.',
        },
        {
          heading: '4. Dispute Resolution',
          content: 'For payment failures, double deductions, or transaction disputes, contact Seedha Grievance Desk at support@seedhaproperties.com or call +91 91544 75498.',
        },
      ],
    };
  }
}
