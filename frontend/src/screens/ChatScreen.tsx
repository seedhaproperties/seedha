import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  Phone,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Paperclip,
  Send,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import type { Property } from '../types';
import { properties } from '../data/properties';

interface Message {
  id: string;
  text: string;
  from: 'user' | 'owner';
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hi! I am interested in this property. Can you share more details?',
    from: 'user',
    time: '10:30 AM',
  },
  {
    id: '2',
    text: "Hello! Thank you for your interest. Yes, the property is available. It's a well-maintained flat on the 8th floor with a great view.",
    from: 'owner',
    time: '10:32 AM',
  },
  {
    id: '3',
    text: 'Is the price negotiable?',
    from: 'user',
    time: '10:33 AM',
  },
  {
    id: '4',
    text: 'We can discuss. The listed price is our best offer, but we can work out on the furnishing or registration charges.',
    from: 'owner',
    time: '10:35 AM',
  },
];

const QUICK_REPLIES = [
  'Is this property still available?',
  'What is the final price?',
];

export default function ChatScreen() {
  const { currentScreen, pop, push } = useApp();
  const property = (currentScreen.params?.property as Property) || properties[0];

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<any>(null);

  const ownerName = property.ownerName || 'Rajesh Kumar';
  const ownerAvatar =
    property.ownerAvatar ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format';

  const handleCall = () => {
    const phoneNumber = '+919853424560';
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Phone Call', 'Calling +91 98534 24560');
    });
  };

  const handleAttachment = () => {
    Alert.alert('Attach File', 'Select document or image to send to the owner.');
  };

  const handleSend = (textToSend?: string) => {
    const content = textToSend !== undefined ? textToSend : inputText;
    if (!content.trim()) return;

    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      text: content.trim(),
      from: 'user',
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (textToSend === undefined) {
      setInputText('');
    }

    // Automated simulated reply from owner
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const replies = [
        'Sure, let me check the schedule and get back to you shortly.',
        'Yes, you can schedule a physical site visit anytime between 10 AM to 6 PM.',
        'We can certainly discuss that during a property visit.',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const ownerReply: Message = {
        id: (Date.now() + 1).toString(),
        text: randomReply,
        from: 'owner',
        time: replyTime,
      };

      setMessages((prev) => [...prev, ownerReply]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* ── 1. Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={pop}
          style={styles.backCircleBtn}
          activeOpacity={0.8}
        >
          <ChevronLeft size={20} color="#1E293B" strokeWidth={2.4} />
        </TouchableOpacity>

        <Image source={{ uri: ownerAvatar }} style={styles.headerAvatar} />

        <View style={styles.headerInfoCol}>
          <Text style={styles.headerOwnerName}>{ownerName}</Text>
          <Text style={styles.headerOnlineStatus}>Online</Text>
        </View>

        <TouchableOpacity
          onPress={handleCall}
          style={styles.callCircleBtn}
          activeOpacity={0.8}
        >
          <Phone size={17} color="#1E293B" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* ── 2. Scrollable Chat Body ── */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatScrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {/* Property Summary Card at Top */}
        <TouchableOpacity
          style={styles.propertyCard}
          onPress={() => push({ name: 'propertyDetail', params: { property } })}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: property.image }}
            style={styles.propertyThumb}
            resizeMode="cover"
          />
          <View style={styles.propertyDetailsCol}>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {property.title}
            </Text>
            <View style={styles.propertyLocationRow}>
              <MapPin size={11} color="#94A3B8" />
              <Text style={styles.propertyLocationText} numberOfLines={1}>
                {property.location}
              </Text>
            </View>
            <Text style={styles.propertyPriceText}>
              {property.priceLabel || `₹${property.price.toLocaleString('en-IN')}`}
            </Text>
          </View>

          {/* Quick specs on right: beds, baths, sqft */}
          <View style={styles.propertySpecsCol}>
            <View style={styles.specItemRow}>
              <BedDouble size={12} color="#94A3B8" />
              <Text style={styles.specItemText}>{property.bedrooms || 3}</Text>
              <Bath size={12} color="#94A3B8" style={{ marginLeft: 4 }} />
              <Text style={styles.specItemText}>{property.bathrooms || 2}</Text>
              <Square size={12} color="#94A3B8" style={{ marginLeft: 4 }} />
              <Text style={styles.specItemText}>{property.area || 1450}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Messages Stream */}
        {messages.map((msg) => {
          const isUser = msg.from === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isUser ? styles.userMessageRow : styles.ownerMessageRow,
              ]}
            >
              {/* Owner Avatar on Left */}
              {!isUser && (
                <Image
                  source={{ uri: ownerAvatar }}
                  style={styles.bubbleOwnerAvatar}
                />
              )}

              <View
                style={[
                  styles.messageBubbleContainer,
                  isUser ? styles.userContainer : styles.ownerContainer,
                ]}
              >
                {/* Message Bubble Box */}
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.ownerBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.userMessageText : styles.ownerMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>

                {/* Timestamp below bubble */}
                <Text
                  style={[
                    styles.timestampText,
                    isUser ? styles.userTimestamp : styles.ownerTimestamp,
                  ]}
                >
                  {msg.time}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ── 3. Quick Replies Carousel ── */}
      <View style={styles.quickRepliesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRepliesScroll}
        >
          {QUICK_REPLIES.map((reply) => (
            <TouchableOpacity
              key={reply}
              style={styles.quickReplyPill}
              onPress={() => handleSend(reply)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── 4. Fixed Bottom Input Bar ── */}
      <View style={styles.inputBar}>
        {/* Attachment Button */}
        <TouchableOpacity
          style={styles.attachmentBtn}
          onPress={handleAttachment}
          activeOpacity={0.8}
        >
          <Paperclip size={18} color="#64748B" strokeWidth={2.2} />
        </TouchableOpacity>

        {/* Text Input Pill */}
        <View style={styles.inputPill}>
          <TextInput
            style={[
              styles.textInput,
              Platform.select({
                web: { outlineWidth: 0 } as any,
              }),
            ]}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendBtn,
            inputText.trim().length > 0 && styles.sendBtnActive,
          ]}
          onPress={() => handleSend()}
          activeOpacity={0.85}
        >
          <Send size={16} color="#FFFFFF" strokeWidth={2.4} />
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
    backgroundColor: '#CBD5E1',
  },
  headerInfoCol: {
    flex: 1,
    marginLeft: 10,
  },
  headerOwnerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 1,
  },
  headerOnlineStatus: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  callCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Chat Scroll ── */
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },

  /* ── Property Summary Card ── */
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  propertyThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
  },
  propertyDetailsCol: {
    flex: 1,
    marginLeft: 10,
  },
  propertyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  propertyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 3,
  },
  propertyLocationText: {
    fontSize: 11,
    color: '#64748B',
  },
  propertyPriceText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  propertySpecsCol: {
    justifyContent: 'center',
    paddingLeft: 4,
  },
  specItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  specItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  /* ── Messages Stream ── */
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  ownerMessageRow: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  bubbleOwnerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    marginTop: 2,
    backgroundColor: '#CBD5E1',
  },
  messageBubbleContainer: {
    maxWidth: '82%',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  ownerContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#000000',
    borderTopRightRadius: 6,
  },
  ownerBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  ownerMessageText: {
    color: '#0F172A',
    fontWeight: '400',
  },
  timestampText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  userTimestamp: {
    textAlign: 'right',
    marginRight: 4,
  },
  ownerTimestamp: {
    textAlign: 'left',
    marginLeft: 4,
  },

  /* ── Quick Replies ── */
  quickRepliesContainer: {
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
  },
  quickRepliesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickReplyPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  quickReplyText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },

  /* ── Input Bar ── */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  attachmentBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputPill: {
    flex: 1,
    height: 42,
    backgroundColor: '#F1F5F9',
    borderRadius: 21,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#000000',
  },
});
