import React, { useState, useRef, useEffect } from 'react';
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
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import type { Property } from '../../types';
import { properties } from '../../data/properties';
import { api } from '../../services/api';
import { PaymentGatewayModal } from '../../components/PaymentGatewayModal';

interface Message {
  id: string;
  text: string;
  from: 'user' | 'owner';
  time: string;
  isPaymentPrompt?: boolean;
  paymentAmount?: number;
  paymentStatus?: 'PENDING' | 'COMPLETED';
  paymentTxnId?: string;
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
  {
    id: '5',
    text: 'You can reserve this property immediately with a Seedha 100% refundable token advance of ₹2,000.',
    from: 'owner',
    time: '10:36 AM',
    isPaymentPrompt: true,
    paymentAmount: 2000,
    paymentStatus: 'PENDING',
  },
];

const QUICK_REPLIES = [
  'Is this property still available?',
  'What is the final price?',
  'Can we schedule a visit today?',
  '💳 Pay ₹2,000 Token Advance',
  '🛡️ Verify Owner (₹799)',
];

export default function ChatScreen() {
  const { currentScreen, pop, push, user } = useApp();
  const property = (currentScreen.params?.property as Property) || properties[0];
  const flatmateParam = currentScreen.params?.flatmate as
    | {
        name: string;
        firstName?: string;
        age?: number;
        role?: string;
        gender?: string;
        profession?: string;
        phone?: string;
        email?: string;
        tags?: string[];
        initial?: string;
      }
    | undefined;

  const flowParam = currentScreen.params?.flow as string | undefined;
  const isFlatmateChat =
    flowParam === 'flatmates' ||
    Boolean(flatmateParam) ||
    Boolean(currentScreen.params?.flatmateName) ||
    (property as any).roomType !== undefined ||
    (property.id && property.id.startsWith('fm-'));

  // Flatmate profile details
  const flatmateName =
    flatmateParam?.firstName ||
    flatmateParam?.name?.split(',')[0]?.trim() ||
    (currentScreen.params?.flatmateName as string) ||
    'Rohit';

  const flatmateInitial = flatmateParam?.initial || flatmateName.charAt(0).toUpperCase();

  const flatmatePhone = flatmateParam?.phone || '+91 99175 57138';

  const chatPartnerName = isFlatmateChat ? flatmateName : property.ownerName || 'Rajesh Kumar';

  const ownerAvatar =
    property.ownerAvatar ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format';

  // Initial messages tailored for flatmate or owner
  const initialChatMessages: Message[] = isFlatmateChat
    ? [
        {
          id: '1',
          text: 'Hi! I am interested in this flatmate listing. Can you share more details?',
          from: 'user',
          time: '10:30 AM',
        },
        {
          id: '2',
          text: `Hello! Thank you for reaching out. Yes, the room is available in our flat. It is a quiet, comfortable space with great roommates.`,
          from: 'owner',
          time: '10:32 AM',
        },
        {
          id: '3',
          text: 'Is the rent negotiable?',
          from: 'user',
          time: '10:33 AM',
        },
        {
          id: '4',
          text: 'We can discuss that when you come over to see the flat and meet us!',
          from: 'owner',
          time: '10:35 AM',
        },
      ]
    : INITIAL_MESSAGES;

  const [messages, setMessages] = useState<Message[]>(initialChatMessages);
  const [inputText, setInputText] = useState('');
  const [isChatUnlocked, setIsChatUnlocked] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentData, setPaymentData] = useState<{ amount: number; purpose: string; propertyId?: string }>({
    amount: 99,
    purpose: 'Direct Owner Chat & Contact Unlock',
    propertyId: property.id,
  });
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const scrollViewRef = useRef<any>(null);

  // Check if chat is already unlocked for this property
  useEffect(() => {
    let isMounted = true;
    if (currentScreen.params?.isUnlocked) {
      setIsChatUnlocked(true);
      return;
    }

    if (property?.id) {
      api.chat
        .getStatus(property.id)
        .then((res) => {
          if (isMounted && res?.isUnlocked) {
            setIsChatUnlocked(true);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [property?.id, currentScreen.params?.isUnlocked]);

  // Load chat conversation from Supabase PostgreSQL & poll for real-time updates
  useEffect(() => {
    let isMounted = true;
    if (!property?.id) return;

    const fetchConversation = async () => {
      try {
        const conv = await api.chat.getConversation(property.id);
        if (isMounted && conv && conv.messages && conv.messages.length > 0) {
          const mapped: Message[] = conv.messages.map((m: any) => ({
            id: m.id,
            text: m.text || m.message,
            from: m.senderType === 'OWNER' || m.senderRole === 'OWNER' ? 'owner' : 'user',
            time: new Date(m.createdAt || Date.now()).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }),
            isPaymentPrompt: Boolean(m.isPaymentPrompt),
            paymentAmount: m.paymentAmount,
            paymentStatus: m.paymentStatus,
            paymentTxnId: m.paymentTxnId,
          }));

          setMessages((prev) => {
            // Only update if messages length or latest message changed to prevent flicker
            if (prev.length === mapped.length && prev[prev.length - 1]?.id === mapped[mapped.length - 1]?.id) {
              return prev;
            }
            return mapped;
          });
        }
      } catch {}
    };

    fetchConversation();
    const pollTimer = setInterval(fetchConversation, 3500);

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, [property?.id]);

  const handleCall = () => {
    if (!isChatUnlocked) {
      openPaymentForUnlock();
      return;
    }
    const rawNumber = isFlatmateChat ? flatmatePhone : '+919853424560';
    const cleanNumber = rawNumber.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Phone Call', `Calling ${rawNumber}`);
    });
  };

  const handleAttachment = () => {
    if (!isChatUnlocked) {
      openPaymentForUnlock();
      return;
    }
    Alert.alert('Attach File', 'Select document or image to send to the owner.');
  };

  const openPaymentForUnlock = () => {
    setActivePromptId('chat-unlock');
    setPaymentData({
      amount: 99,
      purpose: 'Direct Owner Chat & Contact Unlock',
      propertyId: property.id,
    });
    setPaymentModalVisible(true);
  };

  const openPaymentForPrompt = (msgId: string, amount: number = 2000, purpose: string = 'Property Token Advance') => {
    setActivePromptId(msgId);
    setPaymentData({
      amount,
      purpose,
      propertyId: property.id,
    });
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = (txn: { transactionId: string; amount: number; purpose: string; gateway: string }) => {
    const confirmTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // ── 1. If this was a Chat Unlock payment ──
    if (activePromptId === 'chat-unlock' || txn.purpose.includes('Unlock') || txn.amount === 99) {
      setIsChatUnlocked(true);

      const unlockNotice: Message = {
        id: Date.now().toString(),
        text: `🔓 Direct Owner Chat Unlocked!\nPayment of ₹${txn.amount.toLocaleString('en-IN')} completed via ${txn.gateway}.\nTransaction ID: ${txn.transactionId}\nYou can now chat in real time directly with ${chatPartnerName}.`,
        from: 'user',
        time: confirmTime,
      };

      setMessages((prev) => [...prev, unlockNotice]);

      // Record unlock notice in Supabase database
      api.chat.send({
        propertyId: property.id,
        text: `[System] User unlocked direct real-time chat (Payment: ₹${txn.amount}, Txn: ${txn.transactionId}).`,
        message: `[System] User unlocked direct real-time chat (Payment: ₹${txn.amount}, Txn: ${txn.transactionId}).`,
        senderName: user?.name || 'Customer',
        senderType: 'USER',
        ownerName: property.ownerName,
        ownerPhone: property.ownerPhone,
      }).catch(() => {});

      // Welcome reply from owner
      setTimeout(() => {
        const ackTime = new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        const welcomeMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Hello! Thank you for connecting. I am available to answer your questions or arrange a property visit at your preferred time.`,
          from: 'owner',
          time: ackTime,
        };
        setMessages((prev) => [...prev, welcomeMessage]);
      }, 1000);

      return;
    }

    // ── 2. In-Chat Token Deposit Payment ──
    if (activePromptId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === activePromptId
            ? { ...m, paymentStatus: 'COMPLETED', paymentTxnId: txn.transactionId }
            : m
        )
      );
    }

    const successMessage: Message = {
      id: Date.now().toString(),
      text: `✅ Payment of ₹${txn.amount.toLocaleString('en-IN')} for "${txn.purpose}" completed via ${txn.gateway}!\nTransaction ID: ${txn.transactionId}\nFunds held securely in Seedha Escrow.`,
      from: 'user',
      time: confirmTime,
    };

    setMessages((prev) => [...prev, successMessage]);

    // Save payment confirmation in DB
    api.chat.send({
      propertyId: property.id,
      text: successMessage.text,
      message: successMessage.text,
      senderName: user?.name || 'Customer',
      senderType: 'USER',
      ownerName: property.ownerName,
      ownerPhone: property.ownerPhone,
    }).catch(() => {});

    // Automated acknowledgement from owner
    setTimeout(() => {
      const ackTime = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const ackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Thank you! I have received confirmation of your token payment of ₹${txn.amount.toLocaleString('en-IN')}. The property reservation is now confirmed on hold for you. Let me know when you'd like to sign the agreement or visit.`,
        from: 'owner',
        time: ackTime,
      };
      setMessages((prev) => [...prev, ackMessage]);
    }, 1200);
  };

  const handleSend = async (textToSend?: string) => {
    const content = textToSend !== undefined ? textToSend : inputText;
    if (!content.trim()) return;

    // Check if quick reply triggers payment gateway directly
    if (content.includes('Pay ₹2,000 Token Advance')) {
      openPaymentForPrompt('quick-token', 2000, 'Property Token Advance Deposit');
      return;
    }
    if (content.includes('Verify Owner (₹799)')) {
      openPaymentForPrompt('quick-verify', 799, 'Owner Legal Background Verification');
      return;
    }

    // Chat Gating: If chat is not unlocked, trigger unlock payment
    if (!isChatUnlocked) {
      openPaymentForUnlock();
      return;
    }

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

    try {
      const res = await api.chat.send({
        propertyId: property.id,
        text: content.trim(),
        message: content.trim(),
        senderName: user?.name || 'Customer',
        senderType: 'USER',
        senderRole: 'CUSTOMER',
        ownerName: property.ownerName,
        ownerPhone: property.ownerPhone,
      });

      if (res && res.ownerReply) {
        const replyTime = new Date(res.ownerReply.createdAt || Date.now()).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        const ownerReply: Message = {
          id: res.ownerReply.id || (Date.now() + 1).toString(),
          text: res.ownerReply.text || res.ownerReply.message,
          from: 'owner',
          time: replyTime,
          isPaymentPrompt: res.ownerReply.isPaymentPrompt,
          paymentAmount: res.ownerReply.paymentAmount,
          paymentStatus: res.ownerReply.paymentStatus,
        };
        setMessages((prev) => [...prev, ownerReply]);
      }
    } catch {
      // Offline fallback simulation
      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        const replies = isFlatmateChat
          ? [
              `Sounds good! Happy to show you around the room and apartment.`,
              `Sure thing, feel free to drop by anytime this weekend!`,
              `Yes, all amenities including high-speed internet and washing machine are included.`,
            ]
          : [
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
    }
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

        {isFlatmateChat ? (
          <View style={styles.headerFlatmateAvatar}>
            <Text style={styles.headerFlatmateInitial}>{flatmateInitial}</Text>
          </View>
        ) : (
          <Image source={{ uri: ownerAvatar }} style={styles.headerAvatar} />
        )}

        <View style={styles.headerInfoCol}>
          <Text style={styles.headerOwnerName}>{chatPartnerName}</Text>
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
              {/* Partner Avatar on Left */}
              {!isUser && (
                isFlatmateChat ? (
                  <View style={styles.bubbleFlatmateAvatar}>
                    <Text style={styles.bubbleFlatmateInitial}>{flatmateInitial}</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: ownerAvatar }}
                    style={styles.bubbleOwnerAvatar}
                  />
                )
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

                  {/* In-chat payment prompt card */}
                  {msg.isPaymentPrompt && (
                    <View style={styles.promptCard}>
                      <View style={styles.promptHeader}>
                        <ShieldCheck size={16} color="#16A34A" />
                        <Text style={styles.promptHeaderText}>Seedha 100% Refundable Escrow</Text>
                      </View>
                      <View style={styles.promptAmountRow}>
                        <Text style={styles.promptAmountLabel}>Required Token:</Text>
                        <Text style={styles.promptAmountValue}>
                          ₹{(msg.paymentAmount || 2000).toLocaleString('en-IN')}
                        </Text>
                      </View>
                      {msg.paymentStatus === 'COMPLETED' ? (
                        <View style={styles.promptPaidBadge}>
                          <CheckCircle2 size={16} color="#15803D" />
                          <Text style={styles.promptPaidText}>Payment Verified & Held in Escrow</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.promptPayBtn}
                          onPress={() =>
                            openPaymentForPrompt(
                              msg.id,
                              msg.paymentAmount || 2000,
                              `Token Advance for ${property.title}`
                            )
                          }
                          activeOpacity={0.85}
                        >
                          <CreditCard size={15} color="#FFFFFF" />
                          <Text style={styles.promptPayBtnText}>
                            Pay ₹{(msg.paymentAmount || 2000).toLocaleString('en-IN')} Now
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
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

      {/* ── 3. Direct Owner Chat Gating Banner ── */}
      {!isChatUnlocked ? (
        <View style={styles.unlockBanner}>
          <View style={styles.unlockLeft}>
            <View style={styles.lockCircle}>
              <Lock size={15} color="#FFFFFF" strokeWidth={2.4} />
            </View>
            <View style={styles.unlockTextCol}>
              <Text style={styles.unlockTitle}>Direct Owner Chat Locked</Text>
              <Text style={styles.unlockSubtitle}>Pay ₹99 once to unlock direct real-time chat with owner</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.unlockPayBtn}
            onPress={openPaymentForUnlock}
            activeOpacity={0.85}
          >
            <CreditCard size={14} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.unlockPayBtnText}>Unlock (₹99)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.unlockedActiveBanner}>
          <CheckCircle2 size={14} color="#16A34A" strokeWidth={2.4} />
          <Text style={styles.unlockedActiveText}>
            Verified Direct Chat Active • Real-Time messaging enabled
          </Text>
        </View>
      )}

      {/* ── 4. Quick Replies Carousel ── */}
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

      {/* ── 5. Fixed Bottom Input Bar ── */}
      <View style={styles.inputBar}>
        {/* Attachment Button */}
        <TouchableOpacity
          style={styles.attachmentBtn}
          onPress={isChatUnlocked ? handleAttachment : openPaymentForUnlock}
          activeOpacity={0.8}
        >
          <Paperclip size={18} color="#64748B" strokeWidth={2.2} />
        </TouchableOpacity>

        {/* Text Input Pill */}
        <TouchableOpacity
          style={styles.inputPill}
          activeOpacity={isChatUnlocked ? 1 : 0.7}
          onPress={!isChatUnlocked ? openPaymentForUnlock : undefined}
        >
          <TextInput
            style={[
              styles.textInput,
              Platform.select({
                web: { outlineWidth: 0 } as any,
              }),
            ]}
            placeholder={
              isChatUnlocked
                ? 'Type a message...'
                : '🔒 Pay ₹99 to unlock and chat in real-time...'
            }
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            editable={isChatUnlocked}
          />
        </TouchableOpacity>

        {/* Send / Unlock Button */}
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (inputText.trim().length > 0 || !isChatUnlocked) && styles.sendBtnActive,
          ]}
          onPress={() => (isChatUnlocked ? handleSend() : openPaymentForUnlock())}
          activeOpacity={0.85}
        >
          {isChatUnlocked ? (
            <Send size={16} color="#FFFFFF" strokeWidth={2.4} />
          ) : (
            <Lock size={15} color="#FFFFFF" strokeWidth={2.4} />
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Gateway Modal with Terms & Conditions */}
      <PaymentGatewayModal
        visible={paymentModalVisible}
        amount={paymentData.amount}
        purpose={paymentData.purpose}
        propertyId={paymentData.propertyId}
        onClose={() => setPaymentModalVisible(false)}
        onSuccess={handlePaymentSuccess}
      />
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
  headerFlatmateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  headerFlatmateInitial: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
  },
  bubbleFlatmateAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  bubbleFlatmateInitial: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
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

  /* ── In-Chat Payment Prompt Card ── */
  promptCard: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  promptHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  promptAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  promptAmountLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  promptAmountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  promptPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E40AF',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  promptPayBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promptPaidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  promptPaidText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },

  /* ── Unlock Direct Chat Floating Banner ── */
  unlockBanner: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  unlockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  lockCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockTextCol: {
    marginLeft: 10,
    flex: 1,
  },
  unlockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unlockSubtitle: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  unlockPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  unlockPayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unlockedActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  unlockedActiveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
});
