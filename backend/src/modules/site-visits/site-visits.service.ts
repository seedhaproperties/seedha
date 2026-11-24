import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { mockDb, SiteVisitRecord } from '../../common/mock-db.js';
import { FirebaseNotificationService } from '../firebase-notification/firebase-notification.service.js';
import { BookVisitDto, SubmitRatingDto } from './site-visits.dto.js';

@Injectable()
export class SiteVisitsService {
  private readonly logger = new Logger(SiteVisitsService.name);

  constructor(private readonly notificationService?: FirebaseNotificationService) {}

  async bookVisit(propertyId: string, dto: BookVisitDto, userId?: string) {
    const property = mockDb.properties.find((p) => p.id === propertyId);
    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    // Check duplicate visit request prevention
    const existing = mockDb.siteVisits.find(
      (v) =>
        v.propertyId === propertyId &&
        v.userPhone === dto.userPhone &&
        v.date === dto.date &&
        v.timeSlot === dto.timeSlot &&
        v.status !== 'CANCELLED',
    );

    if (existing) {
      throw new ConflictException(
        'You already have an active visit booking request for this property at the selected date and time slot.',
      );
    }

    const newVisit: SiteVisitRecord = {
      id: `visit-${Date.now()}`,
      propertyId,
      userId,
      userName: dto.userName,
      userPhone: dto.userPhone,
      userEmail: dto.userEmail,
      date: dto.date,
      timeSlot: dto.timeSlot,
      status: 'CONFIRMED',
      notes: dto.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.siteVisits.unshift(newVisit);

    // Dispatch FCM Booking Confirmation Push Notification asynchronously
    if (this.notificationService) {
      const targetUserId = userId || newVisit.userId;
      if (targetUserId) {
        this.notificationService
          .sendBookingConfirmationNotification(
            targetUserId,
            property.title,
            dto.date,
            dto.timeSlot,
            propertyId,
            newVisit.id,
          )
          .catch((e: any) => this.logger.warn(`Booking confirmation FCM notice: ${e?.message}`));
      }
      // Also notify owner if owner has userId
      if (property.ownerId && property.ownerId !== targetUserId) {
        this.notificationService
          .sendToUser(property.ownerId, {
            title: 'New Site Visit Scheduled! 📅',
            body: `${dto.userName} scheduled a visit for "${property.title}" on ${dto.date} at ${dto.timeSlot}`,
            data: {
              screen: 'bookVisit',
              propertyId,
              visitId: newVisit.id,
              type: 'VISIT_SCHEDULED',
            },
          })
          .catch((e: any) => this.logger.warn(`Owner booking FCM notice: ${e?.message}`));
      }
    }

    return {
      message: 'Property visit booked successfully! Our field team and the owner have been notified.',
      visit: newVisit,
      property: {
        id: property.id,
        title: property.title,
        location: property.location,
        ownerName: property.ownerName,
        ownerPhone: property.ownerPhone,
      },
    };
  }

  async submitRating(visitId: string, dto: SubmitRatingDto) {
    const visit = mockDb.siteVisits.find((v) => v.id === visitId);
    if (!visit) {
      throw new NotFoundException(`Site visit with ID ${visitId} not found`);
    }

    visit.rating = dto.rating;
    visit.ratingComment = dto.ratingComment;
    visit.updatedAt = new Date().toISOString();

    return {
      message: 'Thank you for your rating and feedback!',
      visit,
    };
  }

  async getMyVisits(phoneOrUserId: string) {
    return mockDb.siteVisits.filter(
      (v) => v.userId === phoneOrUserId || v.userPhone === phoneOrUserId,
    );
  }
}
