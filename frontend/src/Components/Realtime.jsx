import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chatbar from './Chatbar';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Realtime({
  currentUser,
  activeChatContext,
  chats: externalChats = [],
  onSelectChat,
  onConfirmationSuccess,
}) {
  const currentUserId = String(currentUser?._id || currentUser?.id || '');
  const [chats, setChats] = useState(externalChats);
  const [selectedChat, setSelectedChat] = useState(activeChatContext || null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationRecord, setConfirmationRecord] = useState(null);

  const messagesEndRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('lifelink_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // ১. ইউজারের সব চ্যাট রুম লোড করা (GET /api/chats)
  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chats`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      const chatList = Array.isArray(data) ? data : data.chats || [];
      setChats(chatList);

      if (!selectedChat && chatList.length > 0) {
        setSelectedChat(chatList[0]);
      } else if (selectedChat) {
        const updated = chatList.find(
          (c) => String(c._id) === String(selectedChat._id)
        );
        if (updated) setSelectedChat(updated);
      }
    } catch {
      // সাইলেন্ট পোলিং এরর
    }
  }, [selectedChat]);

  useEffect(() => {
    if (activeChatContext) {
      setSelectedChat(activeChatContext);
    }
  }, [activeChatContext]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const chatId = selectedChat?._id;

  // ২. সিলেক্টেড চ্যাটের মেসেজ ও কনফার্মেশন স্ট্যাটাস লোড করা
  const fetchMessagesAndStatus = useCallback(
    async (isInitial = false) => {
      if (!chatId) return;
      if (isInitial) setLoadingMessages(true);

      try {
        const res = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          const msgList = Array.isArray(data) ? data : data.messages || [];
          setMessages(msgList);
          if (data.confirmation) {
            setConfirmationRecord(data.confirmation);
          }
        }
      } catch {
        // সাইলেন্ট এরর
      } finally {
        if (isInitial) setLoadingMessages(false);
      }
    },
    [chatId]
  );

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setConfirmationRecord(null);
      return;
    }

    fetchMessagesAndStatus(true);

    // প্রতি ৩ সেকেন্ড পরপর লাইভ মেসেজ পোলিং
    const interval = setInterval(() => {
      fetchMessagesAndStatus(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [chatId, fetchMessagesAndStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // রোল ও রিকোয়েস্ট ডিটেইলস বের করা
  const bloodReq = selectedChat?.bloodRequest || {};
  const donorNotif = selectedChat?.donorNotification || {};
  const requesterId = String(
    bloodReq.requester?._id || bloodReq.requester || donorNotif.requester || ''
  );
  const isRequester = Boolean(requesterId && requesterId === currentUserId);
  const isDonor = Boolean(selectedChat && !isRequester);

  const otherParticipant = (selectedChat?.participants || []).find(
    (p) => String(p._id || p) !== currentUserId
  );

  const chatStatus = selectedChat?.status || 'active';

  // কনফার্মেশন স্ট্যাটাস চেক (DonorNotification বা DonationConfirmation থেকে)
  const myConfirmation = isRequester
    ? confirmationRecord?.requesterConfirmation || donorNotif.requesterConfirmation || 'pending'
    : confirmationRecord?.donorConfirmation || donorNotif.donorConfirmation || 'pending';

  const overallConfirmStatus =
    confirmationRecord?.status ||
    (donorNotif.status === 'confirmed' ? 'confirmed' : 'pending');

  // ৩. নতুন মেসেজ পাঠানো (POST /api/chats/:chatId/messages)
  const handleSendMessage = async (content) => {
    if (!chatId || !content.trim() || sending) return;
    setSending(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message.');
      }

      const createdMsg = data.message || data;
      setMessages((prev) => [...prev, createdMsg]);
    } catch (err) {
      setError(err.message || 'Could not send message.');
      throw err;
    } finally {
      setSending(false);
    }
  };

  // ৪. চ্যাট শেষ করে ডোনেশন কনফার্মেশন শুরু করা (POST /api/chats/:chatId/end)
  const handleEndChatForConfirmation = async () => {
    if (!chatId || actionLoading) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/chats/${chatId}/end`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to end chat.');
      }

      if (data.chat) setSelectedChat(data.chat);
      if (data.confirmation) setConfirmationRecord(data.confirmation);
      await fetchChats();
    } catch (err) {
      setError(err.message || 'Could not end chat.');
    } finally {
      setActionLoading(false);
    }
  };

  // ৫. ডোনার ও রিকোয়েস্টার উভয়ের দ্বিপাক্ষিক ডোনেশন কনফার্মেশন (POST /api/confirmations/:id/respond)
  const handleRespondConfirmation = async (decision) => {
    const confirmationId = confirmationRecord?._id;
    const notifId = donorNotif?._id || selectedChat?.donorNotification;

    if ((!confirmationId && !notifId) || actionLoading) return;
    setActionLoading(true);
    setError('');

    try {
      const endpoint = confirmationId
        ? `${API_BASE_URL}/confirmations/${confirmationId}/respond`
        : `${API_BASE_URL}/donor-notifications/${notifId}/confirm`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ confirmation: decision }), // "yes" | "no"
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit confirmation.');
      }

      if (data.confirmation) setConfirmationRecord(data.confirmation);
      await fetchChats();

      if (data.confirmation?.status === 'confirmed' || decision === 'yes') {
        onConfirmationSuccess?.(bloodReq._id || bloodReq, data);
      }
    } catch (err) {
      setError(err.message || 'Confirmation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderMessageText = (content, isMine) => {
    const text = content || '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, idx) =>
      part.match(urlRegex) ? (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`chat-map-link ${isMine ? 'mine' : 'theirs'}`}
        >
          Open Google Map ↗
        </a>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  return (
    <div className="dark-card">
      {/* অ্যাক্টিভ ও পূর্ববর্তী চ্যাট রুমের তালিকা */}
      {chats.length > 0 && (
        <div className="chat-rooms-bar">
          {chats.map((room) => {
            const isSelected = String(room._id) === String(chatId);
            const req = room.bloodRequest || {};
            const partner = (room.participants || []).find(
              (p) => String(p._id || p) !== currentUserId
            );
            return (
              <button
                key={room._id}
                type="button"
                onClick={() => {
                  setSelectedChat(room);
                  onSelectChat?.(room);
                }}
                className={`room-chip ${isSelected ? 'active' : ''}`}
              >
                💬 {partner?.name || req.hospital || 'Chat'} ({req.bloodGroup || '🩸'})
              </button>
            );
          })}
        </div>
      )}

      {/* টপবার: হাসপাতাল তথ্য ও কনফার্মেশন অ্যাকশন */}
      <div className="chat-topbar">
        <div>
          <h3 className="chat-heading">
            {selectedChat
              ? `💬 Live Chat — ${otherParticipant?.name || 'Participant'} (${bloodReq.bloodGroup || '🩸'})`
              : '💬 Live Coordination Chat'}
          </h3>
          <small className="chat-subtext">
            {selectedChat
              ? `🏥 ${bloodReq.hospital || 'Hospital'} • Role: ${isRequester ? 'Requester' : 'Donor'} • Status: ${chatStatus.toUpperCase()}`
              : 'Accept a donor notification to start live coordination'}
          </small>
        </div>

        {/* স্ট্যাটাস অনুযায়ী অ্যাকশন বাটন */}
        {selectedChat && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {overallConfirmStatus === 'confirmed' ? (
              <span className="tag-pill tag-match chat-confirmed-badge">
                🏅 Donation Verified & Confirmed
              </span>
            ) : chatStatus === 'active' ? (
              <button
                type="button"
                disabled={actionLoading}
                className="btn btn-emerald"
                onClick={handleEndChatForConfirmation}
              >
                {actionLoading ? 'Processing...' : '✅ End Chat & Verify Donation'}
              </button>
            ) : myConfirmation === 'pending' ? (
              <>
                <button
                  type="button"
                  disabled={actionLoading}
                  className="btn btn-emerald"
                  onClick={() => handleRespondConfirmation('yes')}
                >
                  ✅ Yes, Blood Donated
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  className="btn btn-ghost"
                  onClick={() => handleRespondConfirmation('no')}
                >
                  ❌ No
                </button>
              </>
            ) : (
              <span className="tag-pill" style={{ background: '#fef3c7', color: '#92400e' }}>
                ⏳ Waiting for {isRequester ? 'Donor' : 'Requester'} confirmation...
              </span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="auth-error" style={{ margin: '8px 0' }}>
          ⚠️ {error}
        </div>
      )}

      {/* মেসেজ লিস্ট */}
      <div className="chat-messages-box">
        {loadingMessages ? (
          <p className="chat-empty-text">Loading conversation...</p>
        ) : messages.length === 0 ? (
          <p className="chat-empty-text">
            {selectedChat
              ? 'No messages yet. Use the quick replies below to coordinate!'
              : 'No active donation chats yet. Accept a matching notification to start chatting.'}
          </p>
        ) : (
          messages.map((msg) => {
            const senderId = String(msg.sender?._id || msg.sender || '');
            const isMine = senderId === currentUserId;
            const senderLabel = isMine
              ? 'You'
              : msg.sender?.name || otherParticipant?.name || 'Partner';
            const formattedTime = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div key={msg._id} className={`msg-row ${isMine ? 'mine' : 'theirs'}`}>
                <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                  <div className="msg-meta">
                    {senderLabel} {formattedTime && `• ${formattedTime}`}
                  </div>
                  <div className="msg-body">{renderMessageText(msg.content, isMine)}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <Chatbar
        disabled={!selectedChat}
        sending={sending}
        chatStatus={chatStatus}
        isRequester={isRequester}
        onMessageSent={handleSendMessage}
      />
    </div>
  );
}