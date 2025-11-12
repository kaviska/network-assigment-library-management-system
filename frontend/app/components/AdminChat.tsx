'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatService, ChatMessage, chatApi } from '../services/chatService';
import { apiService } from '../services/apiService';

interface Member {
  memberId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  active: boolean;
}

interface AdminChatProps {
  adminId: string;
  adminName: string;
}

export default function AdminChat({ adminId, adminName }: AdminChatProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const chatService = useRef<ChatService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat service
    chatService.current = new ChatService();
    
    // Listen for connection changes BEFORE connecting
    chatService.current.onConnectionChange(setIsConnected);

    // Listen for new messages BEFORE connecting
    chatService.current.onMessage((message) => {
      console.log('Received message:', message);
      // Add all messages to state - duplicates will be filtered in render
      setMessages((prev) => {
        // Check for duplicates
        const isDuplicate = prev.some(m => 
          m.id === message.id || 
          (m.message === message.message && 
           m.senderId === message.senderId && 
           Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000)
        );
        
        if (isDuplicate) {
          console.log('Duplicate message detected, skipping');
          return prev;
        }
        
        console.log('Adding new message to state');
        return [...prev, message];
      });

      // Auto mark as read if this is for the selected member
      if (selectedMember && 
          message.senderType === 'MEMBER' && 
          message.senderId === selectedMember.memberId &&
          message.receiverType === 'ADMIN' &&
          message.receiverId === adminId) {
        chatApi.markAsRead(adminId, 'ADMIN', selectedMember.memberId, 'MEMBER')
          .catch((e) => console.warn('Failed to mark as read:', e));
      }
    });
    
    // Now connect to WebSocket
    chatService.current.connect(adminId, 'ADMIN')
      .then(() => {
        console.log('WebSocket connection established for admin:', adminId);
      })
      .catch((error) => {
        console.error('Failed to connect to chat server:', error);
      });

    // Load members
    loadMembers();

    // Cleanup
    return () => {
      chatService.current?.disconnect();
    };
  }, [adminId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load chat history when member is selected
    if (selectedMember) {
      loadChatHistory(selectedMember);
    }
  }, [selectedMember]);

  const loadMembers = async () => {
    try {
      const response = await apiService.getAllMembers();
      console.log('Loaded members:', response.length);
      setMembers(response.filter((m: Member) => m.active));
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const loadChatHistory = async (member: Member) => {
    console.log('Loading chat history for member:', member.memberId);
    setLoading(true);
    try {
      const history = await chatApi.getChatHistory(
        adminId,
        'ADMIN',
        member.memberId,
        'MEMBER'
      );
      console.log('Loaded chat history:', history.length, 'messages');
      setMessages(history);
      
      // Mark messages as read
      await chatApi.markAsRead(adminId, 'ADMIN', member.memberId, 'MEMBER');
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedMember || !chatService.current) {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasSelectedMember: !!selectedMember, 
        hasChatService: !!chatService.current,
        isConnected 
      });
      return;
    }

    try {
      const messageData = {
        senderType: 'ADMIN',
        senderId: adminId,
        senderName: adminName,
        receiverType: 'MEMBER',
        receiverId: selectedMember.memberId,
        receiverName: selectedMember.name,
        message: newMessage.trim(),
      };
      
      console.log('Sending message:', messageData);
      
      chatService.current.sendMessage(messageData);
      
      setNewMessage('');
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please check your connection.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Members List */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Library Members</h2>
          <div className="flex items-center mt-2">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {members.map((member) => (
            <button
              key={member.memberId}
              onClick={() => setSelectedMember(member)}
              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                selectedMember?.memberId === member.memberId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="font-medium text-gray-900">{member.name}</div>
              <div className="text-sm text-gray-500">{member.memberId}</div>
              {member.email && (
                <div className="text-xs text-gray-400 mt-1">{member.email}</div>
              )}
              {member.registrationDate && (
                <div className="text-xs text-gray-400">
                  Joined: {new Date(member.registrationDate).toLocaleDateString()}
                </div>
              )}
            </button>
          ))}
          {members.length === 0 && (
            <div className="p-4 text-center text-gray-500">No active members found</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedMember ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{selectedMember.name}</h3>
              <p className="text-sm text-gray-600">{selectedMember.email || selectedMember.memberId}</p>
              {selectedMember.phone && (
                <p className="text-xs text-gray-500 mt-1">📞 {selectedMember.phone}</p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.filter(msg =>
                  (msg.senderId === selectedMember.memberId && msg.senderType === 'MEMBER') ||
                  (msg.receiverId === selectedMember.memberId && msg.receiverType === 'MEMBER') ||
                  (msg.senderId === adminId && msg.senderType === 'ADMIN' && msg.receiverId === selectedMember.memberId) ||
                  (msg.receiverId === adminId && msg.receiverType === 'ADMIN' && msg.senderId === selectedMember.memberId)
                ).length === 0 ? (
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">💬</div>
                  <div>No messages yet. Start the conversation!</div>
                </div>
              ) : (
                messages.filter(msg =>
                  (msg.senderId === selectedMember.memberId && msg.senderType === 'MEMBER') ||
                  (msg.receiverId === selectedMember.memberId && msg.receiverType === 'MEMBER') ||
                  (msg.senderId === adminId && msg.senderType === 'ADMIN' && msg.receiverId === selectedMember.memberId) ||
                  (msg.receiverId === adminId && msg.receiverType === 'ADMIN' && msg.senderId === selectedMember.memberId)
                ).map((message, index) => (
                  <div
                    key={message.id || `msg-${index}`}
                    className={`flex ${message.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                        message.senderType === 'ADMIN'
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">{message.senderName}</div>
                      <div className="break-words">{message.message}</div>
                      {message.timestamp && (
                        <div className="text-xs opacity-75 mt-1 flex items-center justify-between">
                          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                          {message.senderType === 'ADMIN' && (
                            <span className="ml-2">✓</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isConnected}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !newMessage.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Send
                </button>
              </div>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-2">⚠️ Not connected to chat server</p>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <div className="text-lg font-medium">Select a member to start chatting</div>
              <div className="text-sm mt-2">Choose from the list on the left</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}