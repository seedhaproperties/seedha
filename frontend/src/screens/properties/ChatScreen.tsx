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
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  CheckCheck,
  Smile,
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
    text: "Hello! Thank you for your interest. Yes, the property is available. It's a well-maintained space with great amenities.",
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
  const insets = useSafeAreaInsets();
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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<any>(null);

  // Auto-scroll when keyboard opens or hides
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 120);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
    Alert.alert('Attach File', 'Select document or image to send.');
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
        text: `[System] User unlocked direct real-time chat (Payment: ₹${txn.amount}, Txn: ${txn.transactionId}).`,
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
        text: `Thank you! I have received confirmation of your token payment of ₹${txn.amount.toLocaleString('en-IN')}. The reservation is confirmed on hold for you. Let me know when you'd like to sign the agreement or visit.`,
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
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.container}>
        {/* ── 1. WhatsApp Top Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={pop}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#111B21" strokeWidth={2.4} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerPartnerRow}
            onPress={() => push({ name: 'propertyDetail', params: { property } })}
            activeOpacity={0.8}
          >
            {isFlatmateChat ? (
              <View style={styles.headerFlatmateAvatar}>
                <Text style={styles.headerFlatmateInitial}>{flatmateInitial}</Text>
              </View>
            ) : (
              <Image source={{ uri: ownerAvatar }} style={styles.headerAvatar} />
            )}

            <View style={styles.headerInfoCol}>
              <Text style={styles.headerOwnerName} numberOfLines={1}>
                {chatPartnerName}
              </Text>
              <Text style={styles.headerOnlineStatus}>online</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCall}
            style={styles.callBtn}
            activeOpacity={0.7}
          >
            <Phone size={19} color="#111B21" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* ── 2. WhatsApp Scrollable Chat Body ── */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {/* WhatsApp Shared Listing Card at Top */}
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
                <MapPin size={11} color="#667781" />
                <Text style={styles.propertyLocationText} numberOfLines={1}>
                  {property.location}
                </Text>
              </View>
              <Text style={styles.propertyPriceText}>
                {property.priceLabel || `₹${property.price.toLocaleString('en-IN')}`}
              </Text>
            </View>

            {/* Quick specs */}
            <View style={styles.propertySpecsCol}>
              <View style={styles.specItemRow}>
                <BedDouble size={12} color="#667781" />
                <Text style={styles.specItemText}>{property.bedrooms || 3}</Text>
                <Bath size={12} color="#667781" style={{ marginLeft: 4 }} />
                <Text style={styles.specItemText}>{property.bathrooms || 2}</Text>
                <Square size={12} color="#667781" style={{ marginLeft: 4 }} />
                <Text style={styles.specItemText}>{property.area || 1450}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Messages Stream */}
          {messages.map((msg) => {
            const isUser = msg.from === 'user';
            const isSystemMessage =
              msg.text.startsWith('[System]') ||
              msg.text.includes('Direct Owner Chat Unlocked') ||
              msg.text.includes('unlocked direct real-time chat');

            // ── WhatsApp Centered Security/System Notice Pill ──
            if (isSystemMessage) {
              const cleanText = msg.text
                .replace(/^\[System\]\s*/i, '')
                .replace(/[\r\n]+/g, ' ');
              return (
                <View key={msg.id} style={styles.systemPillContainer}>
                  <View style={styles.systemPill}>
                    <ShieldCheck size={13} color="#854D0E" strokeWidth={2.2} style={{ marginRight: 6 }} />
                    <Text style={styles.systemPillText}>{cleanText}</Text>
                  </View>
                </View>
              );
            }

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.userMessageRow : styles.ownerMessageRow,
                ]}
              >
                {/* Incoming partner avatar on left */}
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

                {/* WhatsApp Chat Bubble */}
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

                  {/* In-Chat Payment Prompt Card (Token Advance) */}
                  {msg.isPaymentPrompt && (
                    <View style={styles.promptCard}>
                      <View style={styles.promptHeader}>
                        <ShieldCheck size={16} color="#008069" />
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

                  {/* Bottom Meta Row inside bubble: Time + Blue Double Ticks */}
                  <View style={styles.bubbleMetaRow}>
                    <Text
                      style={[
                        styles.bubbleTimeText,
                        isUser ? styles.userTimeText : styles.ownerTimeText,
                      ]}
                    >
                      {msg.time}
                    </Text>
                    {isUser && (
                      <CheckCheck size={15} color="#53BDEB" strokeWidth={2.4} style={styles.checkIcon} />
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ── 3. Direct Owner Chat Gating Banner (if locked) ── */}
        {!isChatUnlocked && (
          <View style={styles.unlockBanner}>
            <View style={styles.unlockLeft}>
              <View style={styles.lockCircle}>
                <Lock size={14} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <View style={styles.unlockTextCol}>
                <Text style={styles.unlockTitle}>Direct Owner Chat Locked</Text>
                <Text style={styles.unlockSubtitle}>Pay ₹99 once to unlock real-time direct owner chat</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.unlockPayBtn}
              onPress={openPaymentForUnlock}
              activeOpacity={0.85}
            >
              <CreditCard size={13} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.unlockPayBtnText}>Unlock (₹99)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── 4. Quick Replies Carousel ── */}
        <View style={styles.quickRepliesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRepliesScroll}
            keyboardShouldPersistTaps="handled"
          >
            {QUICK_REPLIES.map((reply) => (
              <TouchableOpacity
                key={reply}
                style={styles.quickReplyPill}
                onPress={() => handleSend(reply)}
                activeOpacity={0.75}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── 5. WhatsApp Floating Bottom Input Bar ── */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: isKeyboardVisible ? 8 : Math.max(insets.bottom, 8) },
          ]}
        >
          {/* White WhatsApp Input Capsule */}
          <View style={styles.inputPillContainer}>
            <TouchableOpacity
              style={styles.inputInnerIconBtn}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <Smile size={22} color="#8696A0" strokeWidth={2} />
            </TouchableOpacity>

            {isChatUnlocked ? (
              <TextInput
                style={[
                  styles.textInput,
                  { maxHeight: 110 },
                  Platform.select({
                    web: { outlineWidth: 0 } as any,
                  }),
                ]}
                placeholder="Message"
                placeholderTextColor="#8696A0"
                value={inputText}
                onChangeText={setInputText}
                multiline
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 120);
                }}
                onSubmitEditing={() => handleSend()}
                returnKeyType="default"
              />
            ) : (
              <TouchableOpacity
                style={styles.lockedInputTouchable}
                onPress={openPaymentForUnlock}
                activeOpacity={0.8}
              >
                <Text style={styles.lockedInputPlaceholder} numberOfLines={1}>
                  🔒 Pay ₹99 to unlock and chat in real-time...
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.inputInnerIconBtn}
              onPress={isChatUnlocked ? handleAttachment : openPaymentForUnlock}
              activeOpacity={0.7}
            >
              <Paperclip size={20} color="#8696A0" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* WhatsApp Circular Green Send Button */}
          <TouchableOpacity
            style={[
              styles.whatsappSendBtn,
              !isChatUnlocked && styles.whatsappLockBtn,
            ]}
            onPress={() => (isChatUnlocked ? handleSend() : openPaymentForUnlock())}
            activeOpacity={0.85}
          >
            {isChatUnlocked ? (
              <Send size={18} color="#FFFFFF" strokeWidth={2.4} />
            ) : (
              <Lock size={17} color="#FFFFFF" strokeWidth={2.4} />
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#EFEAE2',
  },
  container: {
    flex: 1,
    backgroundColor: '#EFEAE2',
  },

  /* ── WhatsApp Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  backBtn: {
    padding: 6,
    marginRight: 2,
  },
  headerPartnerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerFlatmateAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#008069',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerFlatmateInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: '#CBD5E1',
  },
  headerInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  headerOwnerName: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111B21',
  },
  headerOnlineStatus: {
    fontSize: 12,
    color: '#25D366',
    fontWeight: '500',
    marginTop: 0.5,
  },
  callBtn: {
    padding: 8,
    marginRight: 4,
  },

  /* ── Chat Scroll ── */
  chatScroll: {
    flex: 1,
    backgroundColor: '#EFEAE2',
  },
  chatScrollContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },

  /* ── WhatsApp Shared Property Card ── */
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  propertyThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#CBD5E1',
  },
  propertyDetailsCol: {
    flex: 1,
    marginLeft: 10,
  },
  propertyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111B21',
    marginBottom: 1,
  },
  propertyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  propertyLocationText: {
    fontSize: 11,
    color: '#667781',
  },
  propertyPriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#008069',
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
    color: '#667781',
  },

  /* ── Messages Stream ── */
  messageRow: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  ownerMessageRow: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  bubbleOwnerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 6,
    marginTop: 4,
    backgroundColor: '#CBD5E1',
  },
  bubbleFlatmateAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#008069',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginTop: 4,
  },
  bubbleFlatmateInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },

  /* ── WhatsApp Message Bubbles ── */
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 11,
    paddingTop: 7,
    paddingBottom: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#D9FDD3',
    borderTopRightRadius: 2,
    alignSelf: 'flex-end',
  },
  ownerBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 19.5,
  },
  userMessageText: {
    color: '#111B21',
  },
  ownerMessageText: {
    color: '#111B21',
  },

  /* ── Bubble Meta Row (Time + Checks) ── */
  bubbleMetaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  bubbleTimeText: {
    fontSize: 10.5,
    color: '#667781',
  },
  userTimeText: {
    color: '#667781',
  },
  ownerTimeText: {
    color: '#667781',
  },
  checkIcon: {
    marginLeft: 3,
  },

  /* ── WhatsApp Centered Security/System Pill ── */
  systemPillContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEECB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  systemPillText: {
    fontSize: 11.5,
    color: '#54656F',
    fontWeight: '500',
    lineHeight: 16,
    flexShrink: 1,
  },

  /* ── In-Chat Escrow Prompt Card ── */
  promptCard: {
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  promptHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#008069',
  },
  promptAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptAmountLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  promptAmountValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111B21',
  },
  promptPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008069',
    paddingVertical: 9,
    borderRadius: 8,
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
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  promptPaidText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },

  /* ── Unlock Direct Chat Floating Banner ── */
  unlockBanner: {
    backgroundColor: '#111B21',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#202C33',
  },
  unlockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  lockCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockTextCol: {
    marginLeft: 8,
    flex: 1,
  },
  unlockTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unlockSubtitle: {
    fontSize: 10,
    color: '#8696A0',
    marginTop: 1,
  },
  unlockPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A884',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
    gap: 5,
  },
  unlockPayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ── Quick Replies ── */
  quickRepliesContainer: {
    paddingVertical: 6,
    backgroundColor: '#EFEAE2',
  },
  quickRepliesScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  quickReplyPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickReplyText: {
    fontSize: 12,
    color: '#111B21',
    fontWeight: '500',
  },

  /* ── WhatsApp Input Bar ── */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#EFEAE2',
    paddingHorizontal: 8,
    paddingTop: 6,
    gap: 6,
  },
  inputPillContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 10,
    minHeight: 44,
    maxHeight: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputInnerIconBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111B21',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  lockedInputTouchable: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  lockedInputPlaceholder: {
    fontSize: 13,
    color: '#8696A0',
  },
  whatsappSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00A884',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00A884',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  whatsappLockBtn: {
    backgroundColor: '#2563EB',
  },
});
