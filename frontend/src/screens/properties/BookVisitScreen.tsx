import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Check,
  Send,
  Navigation,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import type { Property } from '../../types';
import { properties } from '../../data/properties';

const TIME_SLOTS = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
];

const getDates = () => {
  const dates = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      day: days[d.getDay()],
      date: d.getDate(),
      month: months[d.getMonth()],
      full: d.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });
  }
  return dates;
};

type Step = 'date' | 'time' | 'confirm' | 'success';

export default function BookVisitScreen() {
  const { currentScreen, pop, setTab } = useApp();
  const property = (currentScreen.params?.property as Property) || properties[0];

  const [step, setStep] = useState<Step>('date');
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(4); // default 4 (Wed)
  const [selectedTime, setSelectedTime] = useState<string | null>('2:00 PM'); // default 2:00 PM as shown in reference
  const [loading, setLoading] = useState(false);

  const dates = getDates();

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 800);
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(`Property Visit: ${property.title}`);
    const details = encodeURIComponent(
      `Visit to ${property.title} located at ${property.location}. Scheduled time: ${selectedTime}`
    );
    const location = encodeURIComponent(property.location);
    // Google Calendar template URL works across web, Android, and iOS browsers
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    Linking.openURL(gCalUrl).catch(() => {});
  };

  const handleGetDirections = () => {
    const query = encodeURIComponent(`${property.title}, ${property.location}`);
    const mapUrl = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(mapUrl || `https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
    });
  };

  // ── Success Step ──
  if (step === 'success') {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.successContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Green Checkmark Circle */}
          <View style={styles.successBadgeCircle}>
            <Check size={28} color="#16A34A" strokeWidth={3} />
          </View>

          <Text style={styles.successTitle}>Visit Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your visit has been scheduled. You'll receive a confirmation on your phone.
          </Text>

          {/* Property & Visit Details Card */}
          <View style={styles.confirmationCard}>
            <View style={styles.confirmationCardHeader}>
              <Image
                source={{ uri: property.image }}
                style={styles.propertyThumb}
                resizeMode="cover"
              />
              <View style={styles.propertyMeta}>
                <Text style={styles.confirmedPropertyTitle} numberOfLines={1}>
                  {property.title}
                </Text>
                <View style={styles.locationRow}>
                  <MapPin size={12} color="#94A3B8" />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {property.location}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.visitTimeDetails}>
              <View style={styles.timeDetailRow}>
                <Calendar size={14} color="#64748B" />
                <Text style={styles.visitTimeText}>
                  {dates[selectedDateIndex]?.full}
                </Text>
              </View>
              <View style={[styles.timeDetailRow, { marginTop: 8 }]}>
                <Clock size={14} color="#64748B" />
                <Text style={styles.visitTimeText}>{selectedTime}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons: Add to Calendar & Get Directions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleAddToCalendar}
              style={styles.addToCalendarBtn}
              activeOpacity={0.85}
            >
              <Calendar size={15} color="#000000" strokeWidth={2} />
              <Text style={styles.addToCalendarBtnText}>Add to Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGetDirections}
              style={styles.getDirectionsBtn}
              activeOpacity={0.85}
            >
              <Navigation size={15} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.getDirectionsBtnText}>Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Back to Property text button */}
          <TouchableOpacity
            onPress={pop}
            style={styles.backPropertyTextBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.backPropertyTextBtnText}>Back to Property</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── 1. Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={step === 'date' ? pop : () => setStep(step === 'confirm' ? 'time' : 'date')}
          style={styles.backCircleBtn}
          activeOpacity={0.8}
        >
          <ChevronLeft size={20} color="#1E293B" strokeWidth={2.4} />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Book a Visit</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {property.title}
          </Text>
        </View>
      </View>

      {/* ── 2. Three-Step Progress Indicator ── */}
      <View style={styles.progressRow}>
        {/* Step 1: Date */}
        <TouchableOpacity
          style={styles.stepItem}
          onPress={() => setStep('date')}
          activeOpacity={0.8}
        >
          {step === 'time' || step === 'confirm' ? (
            <View style={styles.stepBadgeCheck}>
              <Check size={14} color="#16A34A" strokeWidth={3} />
            </View>
          ) : (
            <View
              style={[
                styles.stepBadge,
                styles.stepBadgeActive,
              ]}
            >
              <Text style={styles.stepBadgeTextActive}>1</Text>
            </View>
          )}
          <Text
            style={[
              styles.stepLabel,
              styles.stepLabelInactive,
            ]}
          >
            Date
          </Text>
        </TouchableOpacity>

        <View style={styles.stepLine} />

        {/* Step 2: Time */}
        <TouchableOpacity
          style={styles.stepItem}
          onPress={() => setStep('time')}
          activeOpacity={0.8}
        >
          {step === 'confirm' ? (
            <View style={styles.stepBadgeCheck}>
              <Check size={14} color="#16A34A" strokeWidth={3} />
            </View>
          ) : (
            <View
              style={[
                styles.stepBadge,
                step === 'time' ? styles.stepBadgeActive : styles.stepBadgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.stepBadgeText,
                  step === 'time'
                    ? styles.stepBadgeTextActive
                    : styles.stepBadgeTextInactive,
                ]}
              >
                2
              </Text>
            </View>
          )}
          <Text
            style={[
              styles.stepLabel,
              step === 'time' ? styles.stepLabelActive : styles.stepLabelInactive,
            ]}
          >
            Time
          </Text>
        </TouchableOpacity>

        <View style={styles.stepLine} />

        {/* Step 3: Confirm */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepBadge,
              step === 'confirm'
                ? styles.stepBadgeActive
                : styles.stepBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.stepBadgeText,
                step === 'confirm'
                  ? styles.stepBadgeTextActive
                  : styles.stepBadgeTextInactive,
              ]}
            >
              3
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              step === 'confirm'
                ? styles.stepLabelActive
                : styles.stepLabelInactive,
            ]}
          >
            Confirm
          </Text>
        </View>
      </View>

      {/* ── 3. Step Content Body ── */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Select Date */}
        {step === 'date' && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeading}>Select a Date</Text>

            {/* Horizontal Date Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.datesScroll}
            >
              {dates.map((d, i) => {
                const isSelected = selectedDateIndex === i;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedDateIndex(i)}
                    style={[
                      styles.dateCard,
                      isSelected ? styles.dateCardSelected : styles.dateCardUnselected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected ? styles.textSelected : styles.textUnselected,
                      ]}
                    >
                      {d.day}
                    </Text>
                    <Text
                      style={[
                        styles.dateNumber,
                        isSelected ? styles.textSelected : styles.textUnselected,
                      ]}
                    >
                      {d.date}
                    </Text>
                    <Text
                      style={[
                        styles.monthText,
                        isSelected ? styles.textSelected : styles.textUnselected,
                      ]}
                    >
                      {d.month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Tip Callout */}
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                💡 Tip: Weekday visits tend to be less crowded
              </Text>
            </View>
          </View>
        )}

        {/* Step 2: Select Time */}
        {step === 'time' && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeading}>Select a Time Slot</Text>
            <Text style={styles.sectionSubheading}>
              {dates[selectedDateIndex]?.full}
            </Text>

            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    onPress={() => setSelectedTime(time)}
                    style={[
                      styles.timeSlotCard,
                      isSelected ? styles.timeSlotSelected : styles.timeSlotUnselected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        isSelected ? styles.timeTextSelected : styles.timeTextUnselected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 3: Confirm Details */}
        {step === 'confirm' && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeading}>Confirm Your Visit</Text>

            {/* Property Summary Card */}
            <View style={styles.confirmPreviewCard}>
              <Image
                source={{ uri: property.image }}
                style={styles.confirmImg}
                resizeMode="cover"
              />
              <View style={styles.confirmInfo}>
                <Text style={styles.confirmTitle}>{property.title}</Text>
                <View style={styles.confirmLocationRow}>
                  <MapPin size={12} color="#94A3B8" />
                  <Text style={styles.confirmLocationText}>{property.location}</Text>
                </View>

                {/* Date & Time Separate Chips Row */}
                <View style={styles.confirmCardsRow}>
                  <View style={styles.confirmChip}>
                    <View style={styles.confirmChipIconBox}>
                      <Calendar size={14} color="#64748B" />
                    </View>
                    <View>
                      <Text style={styles.confirmChipLabel}>Date</Text>
                      <Text style={styles.confirmChipValue}>
                        {dates[selectedDateIndex]?.day}, {dates[selectedDateIndex]?.date}{' '}
                        {dates[selectedDateIndex]?.month}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.confirmChip}>
                    <View style={styles.confirmChipIconBox}>
                      <Clock size={14} color="#64748B" />
                    </View>
                    <View>
                      <Text style={styles.confirmChipLabel}>Time</Text>
                      <Text style={styles.confirmChipValue}>{selectedTime}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Yellow Information Notice */}
            <View style={styles.yellowNoticeCard}>
              <Text style={styles.yellowNoticeText}>
                Please bring a valid ID proof for the visit. The owner will be notified of your booking.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── 4. Fixed Bottom Action Button ── */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          disabled={loading}
          onPress={() => {
            if (step === 'date') setStep('time');
            else if (step === 'time') setStep('confirm');
            else handleConfirm();
          }}
          style={styles.continueBtn}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueBtnText}>
              {step === 'confirm' ? 'Confirm Visit' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#F1F5F9',
  },
  backCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTextCol: {
    marginLeft: 14,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },

  /* ── 3-Step Progress Indicator ── */
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F1F5F9',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    backgroundColor: '#000000',
  },
  stepBadgeInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
  },
  stepBadgeTextInactive: {
    color: '#94A3B8',
  },
  stepLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#0F172A',
  },
  stepLabelInactive: {
    color: '#94A3B8',
  },
  stepLine: {
    width: 32,
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },

  /* ── Body Content ── */
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  stepContainer: {
    paddingVertical: 4,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  sectionSubheading: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },

  /* ── Date Cards ── */
  datesScroll: {
    gap: 10,
    paddingBottom: 16,
  },
  dateCard: {
    width: 60,
    height: 92,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  dateCardSelected: {
    backgroundColor: '#000000',
  },
  dateCardUnselected: {
    backgroundColor: '#FFFFFF',
  },
  dayText: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 2,
  },
  monthText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  textSelected: {
    color: '#FFFFFF',
  },
  textUnselected: {
    color: '#334155',
  },

  /* ── Tip Card ── */
  tipCard: {
    backgroundColor: '#EAE7E1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },

  /* ── Time Slots Grid ── */
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlotCard: {
    width: '31%',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  timeSlotSelected: {
    backgroundColor: '#000000',
  },
  timeSlotUnselected: {
    backgroundColor: '#FFFFFF',
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeTextSelected: {
    color: '#FFFFFF',
  },
  timeTextUnselected: {
    color: '#334155',
  },

  /* ── Confirm Step Card ── */
  confirmPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  confirmImg: {
    width: '100%',
    height: 180,
    backgroundColor: '#CBD5E1',
  },
  confirmInfo: {
    padding: 16,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  confirmLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  confirmLocationText: {
    fontSize: 12,
    color: '#64748B',
  },
  confirmCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
  },
  confirmChipIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  confirmChipLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 1,
  },
  confirmChipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  yellowNoticeCard: {
    backgroundColor: '#FEF9C3',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  yellowNoticeText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#854D0E',
    fontWeight: '500',
  },

  /* ── Fixed Bottom Footer ── */
  footerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#F1F5F9',
  },
  continueBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ── Success Screen Styles ── */
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
  },
  successBadgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  confirmationCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  confirmationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
  },
  propertyMeta: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  confirmedPropertyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  visitTimeDetails: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 12,
  },
  timeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitTimeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
    marginLeft: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  addToCalendarBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addToCalendarBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '600',
  },
  getDirectionsBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#000000',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  getDirectionsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  backPropertyTextBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backPropertyTextBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
});
