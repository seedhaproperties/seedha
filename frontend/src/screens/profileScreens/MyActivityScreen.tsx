import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Navigation,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  Phone,
  Check,
  X,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';

export default function MyActivityScreen() {
  const { pop, push, setTab } = useApp();

  // Top segment: 'visits' | 'enquiries'
  const [mainTab, setMainTab] = useState<'visits' | 'enquiries'>('visits');

  // Sub segment for visits: 'visiting' (I am visiting) | 'my_property' (Visiting my property)
  const [visitsSubTab, setVisitsSubTab] = useState<'visiting' | 'my_property'>('visiting');

  // Filter for 'I am visiting': 'all' | 'upcoming' | 'completed' | 'cancelled'
  const [visitsFilter, setVisitsFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  // Sub segment for enquiries: 'sent' (Sent by me) | 'received' (On my property)
  const [enquiriesSubTab, setEnquiriesSubTab] = useState<'sent' | 'received'>('sent');

  // Inline reply text state for enquiry on my property
  const [replyText, setReplyText] = useState('');
  const [repliedEnquiry, setRepliedEnquiry] = useState<string | null>(null);

  // Mutual exclusion cooldown between rows to prevent any simultaneous trigger
  const lastPressRef = useRef<number>(0);

  const handleMainTabChange = (tab: 'visits' | 'enquiries') => {
    const now = Date.now();
    if (now - lastPressRef.current < 350) return;
    lastPressRef.current = now;
    setMainTab(tab);
  };

  const handleVisitsSubTabChange = (sub: 'visiting' | 'my_property') => {
    const now = Date.now();
    if (now - lastPressRef.current < 350) return;
    lastPressRef.current = now;
    setVisitsSubTab(sub);
  };

  const handleEnquiriesSubTabChange = (sub: 'sent' | 'received') => {
    const now = Date.now();
    if (now - lastPressRef.current < 350) return;
    lastPressRef.current = now;
    setEnquiriesSubTab(sub);
  };

  const handleFilterChange = (filter: 'all' | 'upcoming' | 'completed' | 'cancelled') => {
    const now = Date.now();
    if (now - lastPressRef.current < 350) return;
    lastPressRef.current = now;
    setVisitsFilter(filter);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (pop) pop();
              else setTab('profile');
            }}
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color="#1E293B" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.headerTitles}>
            <Text style={styles.pageTitle}>My Activity</Text>
            <Text style={styles.subtitle}>Visits and enquiries, yours and on your homes</Text>
          </View>
        </View>

        {/* Level 1 Main Segment Switcher: Visits vs Enquiries */}
        <View style={styles.mainSegmentContainer}>
          <TouchableOpacity
            key="main-tab-visits"
            style={[
              styles.mainSegmentBtn,
              mainTab === 'visits' && styles.mainSegmentBtnActive,
            ]}
            onPress={() => handleMainTabChange('visits')}
            activeOpacity={0.8}
          >
            <Text style={[styles.mainSegmentText, mainTab === 'visits' && styles.mainSegmentTextActive]}>
              Visits
            </Text>
            <View style={[styles.mainBadge, mainTab === 'visits' && styles.mainBadgeActive]}>
              <Text style={[styles.mainBadgeText, mainTab === 'visits' && styles.mainBadgeTextActive]}>
                8
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            key="main-tab-enquiries"
            style={[
              styles.mainSegmentBtn,
              mainTab === 'enquiries' && styles.mainSegmentBtnActive,
            ]}
            onPress={() => handleMainTabChange('enquiries')}
            activeOpacity={0.8}
          >
            <Text style={[styles.mainSegmentText, mainTab === 'enquiries' && styles.mainSegmentTextActive]}>
              Enquiries
            </Text>
            <View style={[styles.mainBadge, mainTab === 'enquiries' && styles.mainBadgeActive]}>
              <Text style={[styles.mainBadgeText, mainTab === 'enquiries' && styles.mainBadgeTextActive]}>
                6
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Level 2 Sub-Segment Switcher */}
        <View style={styles.subSegmentContainer}>
          {mainTab === 'visits' ? (
            <>
              <TouchableOpacity
                key="sub-visits-visiting"
                style={[
                  styles.subSegmentBtn,
                  visitsSubTab === 'visiting' && styles.subSegmentBtnActive,
                ]}
                onPress={() => handleVisitsSubTabChange('visiting')}
                activeOpacity={0.8}
              >
                <Text style={[styles.subSegmentText, visitsSubTab === 'visiting' && styles.subSegmentTextActive]}>
                  I am visiting
                </Text>
                <View style={[styles.subBadge, visitsSubTab === 'visiting' && styles.subBadgeActive]}>
                  <Text style={[styles.subBadgeText, visitsSubTab === 'visiting' && styles.subBadgeTextActive]}>
                    4
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                key="sub-visits-myprop"
                style={[
                  styles.subSegmentBtn,
                  visitsSubTab === 'my_property' && styles.subSegmentBtnActive,
                ]}
                onPress={() => handleVisitsSubTabChange('my_property')}
                activeOpacity={0.8}
              >
                <Text style={[styles.subSegmentText, visitsSubTab === 'my_property' && styles.subSegmentTextActive]}>
                  Visiting my property
                </Text>
                <View style={[styles.subBadge, visitsSubTab === 'my_property' && styles.subBadgeActive]}>
                  <Text style={[styles.subBadgeText, visitsSubTab === 'my_property' && styles.subBadgeTextActive]}>
                    4
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                key="sub-enq-sent"
                style={[
                  styles.subSegmentBtn,
                  enquiriesSubTab === 'sent' && styles.subSegmentBtnActive,
                ]}
                onPress={() => handleEnquiriesSubTabChange('sent')}
                activeOpacity={0.8}
              >
                <Text style={[styles.subSegmentText, enquiriesSubTab === 'sent' && styles.subSegmentTextActive]}>
                  Sent by me
                </Text>
                <View style={[styles.subBadge, enquiriesSubTab === 'sent' && styles.subBadgeActive]}>
                  <Text style={[styles.subBadgeText, enquiriesSubTab === 'sent' && styles.subBadgeTextActive]}>
                    3
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                key="sub-enq-received"
                style={[
                  styles.subSegmentBtn,
                  enquiriesSubTab === 'received' && styles.subSegmentBtnActive,
                ]}
                onPress={() => handleEnquiriesSubTabChange('received')}
                activeOpacity={0.8}
              >
                <Text style={[styles.subSegmentText, enquiriesSubTab === 'received' && styles.subSegmentTextActive]}>
                  On my property
                </Text>
                <View style={[styles.subBadge, enquiriesSubTab === 'received' && styles.subBadgeActive]}>
                  <Text style={[styles.subBadgeText, enquiriesSubTab === 'received' && styles.subBadgeTextActive]}>
                    3
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Level 3 Filter Pills (Only for 'I am visiting') */}
        {mainTab === 'visits' && visitsSubTab === 'visiting' && (
          <View style={styles.filterPillsRow}>
            {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((filter) => {
              const label = filter.charAt(0).toUpperCase() + filter.slice(1);
              const isActive = visitsFilter === filter;
              return (
                <Pressable
                  key={`filter-${filter}`}
                  style={({ pressed }) => [
                    styles.filterPill,
                    isActive && styles.filterPillActive,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => handleFilterChange(filter)}
                >
                  <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================= */}
        {/* VIEW 1: Visits -> I am visiting (Screenshot 2)           */}
        {/* ========================================================= */}
        {mainTab === 'visits' && visitsSubTab === 'visiting' && (
          <>
            {/* Card 1: 3 BHK Apartment - Upcoming */}
            {(visitsFilter === 'all' || visitsFilter === 'upcoming') && (
              <View style={styles.activityCard}>
                <View style={styles.cardHeaderRow}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=200&h=200&fit=crop&auto=format',
                    }}
                    style={styles.propertyThumb}
                  />
                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.titleStatusRow}>
                      <Text style={styles.propertyTitle}>3 BHK Apartment</Text>
                      <View style={styles.upcomingBadge}>
                        <Clock size={11} color="#475569" strokeWidth={2} />
                        <Text style={styles.upcomingBadgeText}>Upcoming</Text>
                      </View>
                    </View>
                    <View style={styles.locRow}>
                      <MapPin size={11} color="#64748B" strokeWidth={2} />
                      <Text style={styles.locText}>Madhurawada, Vizag</Text>
                    </View>
                    <View style={styles.dateRow}>
                      <Calendar size={11} color="#64748B" strokeWidth={2} />
                      <Text style={styles.dateText}>Sat, 14 Nov · 11:00 AM</Text>
                    </View>
                  </View>
                </View>

                {/* Agent Banner */}
                <View style={styles.agentBanner}>
                  <User size={12} color="#64748B" strokeWidth={2} />
                  <Text style={styles.agentText}>
                    Agent: <Text style={styles.agentName}>Ravi Kumar</Text>
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity style={styles.actionBtnSecondary} activeOpacity={0.8}>
                    <Navigation size={13} color="#1E293B" strokeWidth={2.2} />
                    <Text style={styles.actionBtnSecondaryText}>Directions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtnSecondary} activeOpacity={0.8}>
                    <Text style={styles.actionBtnSecondaryText}>Reschedule</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtnDanger} activeOpacity={0.8}>
                    <Text style={styles.actionBtnDangerText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Card 2: 2 BHK Independent House - Upcoming */}
            {(visitsFilter === 'all' || visitsFilter === 'upcoming') && (
              <View style={styles.activityCard}>
                <View style={styles.cardHeaderRow}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&h=200&fit=crop&auto=format',
                    }}
                    style={styles.propertyThumb}
                  />
                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.titleStatusRow}>
                      <Text style={styles.propertyTitle}>2 BHK Independent H...</Text>
                      <View style={styles.upcomingBadge}>
                        <Clock size={11} color="#475569" strokeWidth={2} />
                        <Text style={styles.upcomingBadgeText}>Upcoming</Text>
                      </View>
                    </View>
                    <View style={styles.locRow}>
                      <MapPin size={11} color="#64748B" strokeWidth={2} />
                      <Text style={styles.locText}>Gajuwaka, Vizag</Text>
                    </View>
                    <View style={styles.dateRow}>
                      <Calendar size={11} color="#64748B" strokeWidth={2} />
                      <Text style={styles.dateText}>Mon, 16 Nov · 4:30 PM</Text>
                    </View>
                  </View>
                </View>

                {/* Agent Banner */}
                <View style={styles.agentBanner}>
                  <User size={12} color="#64748B" strokeWidth={2} />
                  <Text style={styles.agentText}>
                    Agent: <Text style={styles.agentName}>Sneha Reddy</Text>
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity style={styles.actionBtnSecondary} activeOpacity={0.8}>
                    <Navigation size={13} color="#1E293B" strokeWidth={2.2} />
                    <Text style={styles.actionBtnSecondaryText}>Directions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtnSecondary} activeOpacity={0.8}>
                    <Text style={styles.actionBtnSecondaryText}>Reschedule</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtnDanger} activeOpacity={0.8}>
                    <Text style={styles.actionBtnDangerText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Card 3: 3 BHK Flat - Completed */}
            {(visitsFilter === 'all' || visitsFilter === 'completed') && (
              <View style={styles.activityCard}>
                <View style={styles.cardHeaderRow}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&h=200&fit=crop&auto=format',
                    }}
                    style={styles.propertyThumb}
                  />
                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.titleStatusRow}>
                      <Text style={styles.propertyTitle}>3 BHK Flat</Text>
                      <View style={styles.completedBadge}>
                        <CheckCircle2 size={11} color="#10B981" strokeWidth={2.4} />
                        <Text style={styles.completedBadgeText}>Completed</Text>
                      </View>
                    </View>
                    <View style={styles.locRow}>
                      <MapPin size={11} color="#64748B" strokeWidth={2} />
                      <Text style={styles.locText}>Kondapur, Hyderabad</Text>
                    </View>
                    <View style={styles.dateRow}>
                      <Calendar size={11} color="#64748B" strokeWidth={2} />
                      <Text style={styles.dateText}>Sun, 1 Nov · 10:00 AM</Text>
                    </View>
                  </View>
                </View>

                {/* Agent Banner */}
                <View style={styles.agentBanner}>
                  <User size={12} color="#64748B" strokeWidth={2} />
                  <Text style={styles.agentText}>
                    Agent: <Text style={styles.agentName}>Imran Shaik</Text>
                  </Text>
                </View>

                {/* Single View Property Action */}
                <TouchableOpacity
                  style={styles.fullWidthActionBtn}
                  onPress={() => push({ name: 'propertyDetail', params: { id: 'PROP-01' } })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.fullWidthActionText}>View property</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Card 4: Premium Office Space - Cancelled */}
            {(visitsFilter === 'all' || visitsFilter === 'cancelled') && (
              <View style={styles.activityCard}>
                <View style={styles.cardHeaderRow}>
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop&auto=format',
                    }}
                    style={styles.propertyThumb}
                  />
                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.titleStatusRow}>
                      <Text style={styles.propertyTitle}>Premium Office Spa...</Text>
                      <View style={styles.cancelledBadge}>
                        <XCircle size={11} color="#EF4444" strokeWidth={2.4} />
                        <Text style={styles.cancelledBadgeText}>Cancelled</Text>
                      </View>
                    </View>
                    <View style={styles.locRow}>
                      <MapPin size={11} color="#64748B" strokeWidth={2} />
                      <Text style={styles.locText}>HITEC City, Hyderabad</Text>
                    </View>
                    <View style={styles.dateRow}>
                      <Calendar size={11} color="#64748B" strokeWidth={2} />
                      <Text style={styles.dateText}>Fri, 23 Oct · 6:00 PM</Text>
                    </View>
                  </View>
                </View>

                {/* Agent Banner */}
                <View style={styles.agentBanner}>
                  <User size={12} color="#64748B" strokeWidth={2} />
                  <Text style={styles.agentText}>
                    Agent: <Text style={styles.agentName}>Anil Varma</Text>
                  </Text>
                </View>

                {/* Single View Property Action */}
                <TouchableOpacity
                  style={styles.fullWidthActionBtn}
                  onPress={() => push({ name: 'propertyDetail', params: { id: 'PROP-COMM' } })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.fullWidthActionText}>View property</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: Visits -> Visiting my property (Screenshot 3)    */}
        {/* ========================================================= */}
        {mainTab === 'visits' && visitsSubTab === 'my_property' && (
          <>
            {/* Card 1: Rohan Mehta - Needs your reply */}
            <View style={styles.activityCard}>
              <View style={styles.visitorRow}>
                <View style={styles.visitorAvatar}>
                  <Text style={styles.visitorAvatarText}>R</Text>
                </View>
                <View style={styles.visitorInfo}>
                  <Text style={styles.visitorName}>Rohan Mehta</Text>
                  <Text style={styles.visitorSub}>Looking to rent</Text>
                </View>
                <View style={styles.needsReplyBadge}>
                  <Text style={styles.needsReplyText}>Needs your reply</Text>
                </View>
              </View>

              {/* Inner Property Snippet Box */}
              <View style={styles.innerSnippetBox}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=200&h=200&fit=crop&auto=format',
                  }}
                  style={styles.snippetThumb}
                />
                <View style={styles.snippetDetails}>
                  <Text style={styles.snippetTitle}>3 BHK Apartment</Text>
                  <Text style={styles.snippetLoc}>Madhurawada, Vizag</Text>
                  <Text style={styles.snippetDate}>Sun, 15 Nov · 11:30 AM</Text>
                </View>
              </View>

              {/* Action Buttons: Accept / Other time / Decline */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity style={styles.actionBtnPrimary} activeOpacity={0.85}>
                  <Check size={13} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.actionBtnPrimaryText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtnSecondary} activeOpacity={0.8}>
                  <Text style={styles.actionBtnSecondaryText}>Other time</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtnDanger} activeOpacity={0.8}>
                  <Text style={styles.actionBtnDangerText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card 2: Sneha Iyer - Confirmed */}
            <View style={styles.activityCard}>
              <View style={styles.visitorRow}>
                <View style={styles.visitorAvatar}>
                  <Text style={styles.visitorAvatarText}>S</Text>
                </View>
                <View style={styles.visitorInfo}>
                  <Text style={styles.visitorName}>Sneha Iyer</Text>
                  <Text style={styles.visitorSub}>Looking to rent</Text>
                </View>
                <View style={styles.confirmedBadge}>
                  <Text style={styles.confirmedBadgeText}>Confirmed</Text>
                </View>
              </View>

              {/* Inner Property Snippet Box */}
              <View style={styles.innerSnippetBox}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&h=200&fit=crop&auto=format',
                  }}
                  style={styles.snippetThumb}
                />
                <View style={styles.snippetDetails}>
                  <Text style={styles.snippetTitle}>2 BHK Independent House</Text>
                  <Text style={styles.snippetLoc}>Gajuwaka, Vizag</Text>
                  <Text style={styles.snippetDate}>Mon, 16 Nov · 5:00 PM</Text>
                </View>
              </View>

              {/* Action Buttons: Phone & Mark completed */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity style={[styles.actionBtnSecondary, { flex: 1 }]} activeOpacity={0.8}>
                  <Phone size={13} color="#1E293B" strokeWidth={2.2} />
                  <Text style={styles.actionBtnSecondaryText}>+91 99•••• 8810</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtnSecondary, { flex: 1.2 }]} activeOpacity={0.8}>
                  <Text style={styles.actionBtnSecondaryText}>Mark completed</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card 3: Kiran Patel - Completed */}
            <View style={styles.activityCard}>
              <View style={styles.visitorRow}>
                <View style={styles.visitorAvatar}>
                  <Text style={styles.visitorAvatarText}>K</Text>
                </View>
                <View style={styles.visitorInfo}>
                  <Text style={styles.visitorName}>Kiran Patel</Text>
                  <Text style={styles.visitorSub}>Interested in buying</Text>
                </View>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              </View>

              {/* Inner Property Snippet Box */}
              <View style={styles.innerSnippetBox}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=200&h=200&fit=crop&auto=format',
                  }}
                  style={styles.snippetThumb}
                />
                <View style={styles.snippetDetails}>
                  <Text style={styles.snippetTitle}>3 BHK Apartment</Text>
                  <Text style={styles.snippetLoc}>Madhurawada, Vizag</Text>
                  <Text style={styles.snippetDate}>Tue, 3 Nov · 10:00 AM</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: Enquiries -> Sent by me (Screenshot 4)           */}
        {/* ========================================================= */}
        {mainTab === 'enquiries' && enquiriesSubTab === 'sent' && (
          <>
            {/* Card 1: 4 BHK Premium Villa - Replied */}
            <View style={styles.activityCard}>
              <View style={styles.enquiryHeaderRow}>
                <View style={styles.enquiryThumbPlaceholder} />
                <View style={styles.enquiryPropInfo}>
                  <Text style={styles.enquiryPropTitle}>4 BHK Premium Villa</Text>
                  <Text style={styles.enquiryPropSub}>₹1,85,00,000 · Venkata Rao</Text>
                </View>
                <View style={styles.repliedBadge}>
                  <Text style={styles.repliedBadgeText}>Replied</Text>
                </View>
              </View>

              {/* Sent Bubble (Black) */}
              <View style={styles.sentBubble}>
                <Text style={styles.sentBubbleText}>
                  Is the price negotiable? Also, is parking included?
                </Text>
                <Text style={styles.sentBubbleTime}>Today, 11:40 AM</Text>
              </View>

              {/* Received Bubble (Light Gray) */}
              <View style={styles.receivedBubble}>
                <Text style={styles.receivedBubbleText}>
                  Hello! Parking for one car is included. Price is slightly negotiable.
                </Text>
              </View>

              {/* Open Chat Action */}
              <TouchableOpacity
                style={styles.chatActionBtn}
                onPress={() => push({ name: 'chat', params: { title: '4 BHK Premium Villa' } })}
                activeOpacity={0.8}
              >
                <MessageSquare size={13} color="#1E293B" strokeWidth={2.2} />
                <Text style={styles.chatActionText}>Open chat</Text>
              </TouchableOpacity>
            </View>

            {/* Card 2: 2 BHK Apartment - Awaiting reply */}
            <View style={styles.activityCard}>
              <View style={styles.enquiryHeaderRow}>
                <View style={styles.enquiryThumbPlaceholder} />
                <View style={styles.enquiryPropInfo}>
                  <Text style={styles.enquiryPropTitle}>2 BHK Apartment</Text>
                  <Text style={styles.enquiryPropSub}>₹65,00,000 · Lakshmi Devi</Text>
                </View>
                <View style={styles.awaitingBadge}>
                  <Text style={styles.awaitingBadgeText}>Awaiting reply</Text>
                </View>
              </View>

              {/* Sent Bubble (Black) */}
              <View style={styles.sentBubble}>
                <Text style={styles.sentBubbleText}>
                  Can I visit this weekend with my family?
                </Text>
                <Text style={styles.sentBubbleTime}>Yesterday</Text>
              </View>

              {/* Send Reminder Action */}
              <TouchableOpacity style={styles.chatActionBtn} activeOpacity={0.8}>
                <MessageSquare size={13} color="#1E293B" strokeWidth={2.2} />
                <Text style={styles.chatActionText}>Send a reminder</Text>
              </TouchableOpacity>
            </View>

            {/* Card 3: Retail Shop - Closed */}
            <View style={styles.activityCard}>
              <View style={styles.enquiryHeaderRow}>
                <View style={styles.enquiryThumbPlaceholder} />
                <View style={styles.enquiryPropInfo}>
                  <Text style={styles.enquiryPropTitle}>Retail Shop</Text>
                  <Text style={styles.enquiryPropSub}>₹80,000/month · Suresh Babu</Text>
                </View>
                <View style={styles.closedBadge}>
                  <Text style={styles.closedBadgeText}>Closed</Text>
                </View>
              </View>

              {/* Sent Bubble (Black) */}
              <View style={styles.sentBubble}>
                <Text style={styles.sentBubbleText}>
                  Please share the maintenance charges.
                </Text>
                <Text style={styles.sentBubbleTime}>3 days ago</Text>
              </View>

              {/* Received Bubble (Light Gray) */}
              <View style={styles.receivedBubble}>
                <Text style={styles.receivedBubbleText}>
                  Maintenance is ₹3,000 per month.
                </Text>
              </View>

              {/* Open Chat Action */}
              <TouchableOpacity
                style={styles.chatActionBtn}
                onPress={() => push({ name: 'chat', params: { title: 'Retail Shop' } })}
                activeOpacity={0.8}
              >
                <MessageSquare size={13} color="#1E293B" strokeWidth={2.2} />
                <Text style={styles.chatActionText}>Open chat</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: Enquiries -> On my property (Screenshot 5)        */}
        {/* ========================================================= */}
        {mainTab === 'enquiries' && enquiriesSubTab === 'received' && (
          <>
            {/* Card 1: Meera Joshi - New */}
            <View style={styles.activityCard}>
              <View style={styles.visitorRow}>
                <View style={styles.visitorAvatar}>
                  <Text style={styles.visitorAvatarText}>M</Text>
                </View>
                <View style={styles.visitorInfo}>
                  <Text style={styles.visitorName}>Meera Joshi</Text>
                  <Text style={styles.visitorSub}>On 3 BHK Apartment</Text>
                </View>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>New</Text>
                </View>
              </View>

              {/* Received Question Bubble (Light Gray) */}
              <View style={styles.receivedBubble}>
                <Text style={styles.receivedBubbleText}>
                  Is the flat still available? Is the price negotiable?
                </Text>
                <Text style={styles.receivedBubbleTime}>Today, 8:15 AM</Text>
              </View>

              {/* Replied text if already replied */}
              {repliedEnquiry ? (
                <View style={styles.sentBubble}>
                  <Text style={styles.sentBubbleText}>{repliedEnquiry}</Text>
                  <Text style={styles.sentBubbleTime}>Just now</Text>
                </View>
              ) : (
                /* Inline Reply Box */
                <View style={styles.inlineReplyBox}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Write a reply"
                    placeholderTextColor="#94A3B8"
                    value={replyText}
                    onChangeText={setReplyText}
                  />
                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={() => {
                      if (replyText.trim()) {
                        setRepliedEnquiry(replyText.trim());
                        setReplyText('');
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Send size={15} color="#FFFFFF" strokeWidth={2.2} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Card 2: Rahul Nair - Replied */}
            <View style={styles.activityCard}>
              <View style={styles.visitorRow}>
                <View style={styles.visitorAvatar}>
                  <Text style={styles.visitorAvatarText}>R</Text>
                </View>
                <View style={styles.visitorInfo}>
                  <Text style={styles.visitorName}>Rahul Nair</Text>
                  <Text style={styles.visitorSub}>On 2 BHK Independent House</Text>
                </View>
                <View style={styles.repliedBadge}>
                  <Text style={styles.repliedBadgeText}>Replied</Text>
                </View>
              </View>

              {/* Received Question Bubble (Light Gray) */}
              <View style={styles.receivedBubble}>
                <Text style={styles.receivedBubbleText}>
                  Can I move in from 1 December? Are pets allowed?
                </Text>
                <Text style={styles.receivedBubbleTime}>Yesterday</Text>
              </View>

              {/* Sent Bubble (Black) */}
              <View style={styles.sentBubble}>
                <Text style={styles.sentBubbleText}>
                  Yes, 1 December works. Small pets are fine.
                </Text>
              </View>

              {/* Mark as closed Action */}
              <TouchableOpacity style={styles.fullWidthActionBtn} activeOpacity={0.8}>
                <Text style={styles.fullWidthActionText}>Mark as closed</Text>
              </TouchableOpacity>
            </View>

            {/* Card 3: Divya Rao - Closed */}
            <View style={styles.activityCard}>
              <View style={styles.visitorRow}>
                <View style={styles.visitorAvatar}>
                  <Text style={styles.visitorAvatarText}>D</Text>
                </View>
                <View style={styles.visitorInfo}>
                  <Text style={styles.visitorName}>Divya Rao</Text>
                  <Text style={styles.visitorSub}>On Room in 2 BHK, Kondapur</Text>
                </View>
                <View style={styles.closedBadge}>
                  <Text style={styles.closedBadgeText}>Closed</Text>
                </View>
              </View>

              {/* Received Question Bubble (Light Gray) */}
              <View style={styles.receivedBubble}>
                <Text style={styles.receivedBubbleText}>
                  Is the room still available for a female flatmate?
                </Text>
                <Text style={styles.receivedBubbleTime}>4 days ago</Text>
              </View>

              {/* Sent Bubble (Black) */}
              <View style={styles.sentBubble}>
                <Text style={styles.sentBubbleText}>
                  Sorry, this room has been taken.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F9',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitles: {
    marginLeft: 14,
    flex: 1,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  mainSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  mainSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 42,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mainSegmentBtnActive: {
    backgroundColor: '#0F172A',
  },
  mainSegmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  mainSegmentTextActive: {
    color: '#FFFFFF',
  },
  mainBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  mainBadgeActive: {
    backgroundColor: '#334155',
  },
  mainBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  mainBadgeTextActive: {
    color: '#CBD5E1',
  },
  subSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 4,
    marginBottom: 14,
    overflow: 'hidden',
  },
  subSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    minHeight: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  subSegmentBtnActive: {
    backgroundColor: '#0F172A',
  },
  subSegmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  subSegmentTextActive: {
    color: '#FFFFFF',
  },
  subBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  subBadgeActive: {
    backgroundColor: '#334155',
  },
  subBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  subBadgeTextActive: {
    color: '#CBD5E1',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  contentScroll: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 14,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
  },
  propertyThumb: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  titleStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 6,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  upcomingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  cancelledBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
  },
  agentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
  },
  agentText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 6,
  },
  agentName: {
    fontWeight: '700',
    color: '#1E293B',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 5,
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionBtnDanger: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnDangerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 5,
  },
  actionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fullWidthActionBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  fullWidthActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  visitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitorAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  visitorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  visitorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  visitorSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  needsReplyBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  needsReplyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  confirmedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  confirmedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  newBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  innerSnippetBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 10,
    marginTop: 12,
  },
  snippetThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  snippetDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  snippetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  snippetLoc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  snippetDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  enquiryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enquiryThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  enquiryPropInfo: {
    flex: 1,
    marginLeft: 10,
  },
  enquiryPropTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  enquiryPropSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  repliedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  repliedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  awaitingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  awaitingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  closedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  closedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  sentBubble: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  sentBubbleText: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 17,
  },
  sentBubbleTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  receivedBubble: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
  },
  receivedBubbleText: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 17,
  },
  receivedBubbleTime: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    gap: 6,
  },
  chatActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  inlineReplyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
    color: '#1E293B',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
