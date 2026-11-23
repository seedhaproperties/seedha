import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  MessageSquare,
  Calendar,
  Building2,
  Landmark,
  CheckCircle2,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export interface NotificationItem {
  id: string;
  type: 'message' | 'visit' | 'property' | 'loan' | 'verified';
  title: string;
  body: string;
  time: string;
  unread: boolean;
  screen?: string;
  params?: any;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'message',
    title: 'New inquiry from Suresh Babu',
    body: 'Is this property still available?',
    time: '2 min ago',
    unread: true,
  },
  {
    id: '2',
    type: 'visit',
    title: 'Visit Reminder',
    body: 'Your visit to 3 BHK, Madhurawada is tomorrow at 10 AM',
    time: '1 hr ago',
    unread: true,
  },
  {
    id: '3',
    type: 'property',
    title: 'New properties in Madhapur',
    body: '5 new properties match your search criteria',
    time: '3 hr ago',
    unread: true,
  },
  {
    id: '4',
    type: 'loan',
    title: 'Loan offer updated',
    body: 'SBI reduced rates to 8.35%. Check eligibility now!',
    time: '1 day ago',
    unread: false,
  },
  {
    id: '5',
    type: 'verified',
    title: 'Property verified',
    body: 'Your listing at Jubilee Hills has been verified',
    time: '2 days ago',
    unread: false,
  },
  {
    id: '6',
    type: 'message',
    title: 'Owner replied',
    body: 'Property at Kondapur is available. Would you like to visit?',
    time: '3 days ago',
    unread: false,
  },
];

export default function NotificationsScreen() {
  const { pop, push, setTab, user } = useApp();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    let isMounted = true;
    api.notifications.getUserNotifications(user?.id)
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data;
        if (isMounted && list && list.length > 0) {
          setNotifications(list);
        }
      })
      .catch((err) => {
        console.log('[Notifications] Remote feed notice:', err?.message);
      });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationPress = (item: NotificationItem) => {
    // 1. Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n)),
    );

    // 2. Open real notification destination screen
    if (item.screen) {
      push({ name: item.screen as any, params: item.params });
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare size={16} color="#64748B" strokeWidth={2.2} />;
      case 'visit':
        return <Calendar size={16} color="#10B981" strokeWidth={2.2} />;
      case 'property':
        return <Building2 size={16} color="#8B5CF6" strokeWidth={2.2} />;
      case 'loan':
        return <Landmark size={16} color="#D97706" strokeWidth={2.2} />;
      case 'verified':
        return <CheckCircle2 size={16} color="#10B981" strokeWidth={2.2} />;
    }
  };

  const getIconBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'message':
        return '#F1F5F9';
      case 'visit':
        return '#DCFCE7';
      case 'property':
        return '#EDE9FE';
      case 'loan':
        return '#FEF3C7';
      case 'verified':
        return '#DCFCE7';
    }
  };

  const newItems = notifications.filter((n) => n.unread);
  const earlierItems = notifications.filter((n) => !n.unread);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (pop) pop();
              else setTab('home');
            }}
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color="#1E293B" strokeWidth={2.4} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Notifications</Text>

          <TouchableOpacity onPress={markAllRead} activeOpacity={0.8}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* NEW SECTION */}
        {newItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>NEW · {newItems.length}</Text>
            <View style={styles.cardsList}>
              {newItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: getIconBg(item.type) }]}>
                    {getIcon(item.type)}
                  </View>
                  <View style={styles.cardTextCol}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardBody}>{item.body}</Text>
                    <Text style={styles.cardTime}>{item.time}</Text>
                  </View>
                  <View style={styles.unreadDot} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* EARLIER SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>EARLIER</Text>
          <View style={styles.cardsList}>
            {earlierItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: getIconBg(item.type) }]}>
                  {getIcon(item.type)}
                </View>
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardTitleRead}>{item.title}</Text>
                  <Text style={styles.cardBody}>{item.body}</Text>
                  <Text style={styles.cardTime}>{item.time}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  scrollArea: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  cardsList: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardTitleRead: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  cardBody: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  cardTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0F172A',
    marginLeft: 8,
    marginTop: 6,
  },
});
