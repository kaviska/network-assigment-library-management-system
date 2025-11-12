'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatService, ChatMessage, chatApi } from '../services/chatService';
import { apiService } from '../services/apiService';

interface Admin {
  id: number;
  email: string;
  name: string;
  createdDate: string;
  lastLogin: string | null;
  active: boolean;
}

export default function MemberChatPage() {
  const [memberEmail, setMemberEmail] = useState('');
  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const chatService = useRef<ChatService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load chat history when admin is selected
    if (selectedAdmin && isLoggedIn) {
      loadChatHistory(selectedAdmin);
    }
  }, [selectedAdmin, isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      // Find member by email
      const members = await apiService.getAllMembers();
      const member = members.find((m: any) => m.email === memberEmail);

      if (!member) {
        setLoginError('Member not found with this email');
        setLoading(false);
        return;
      }

      setMemberId(member.memberId);
      setMemberName(member.name);
      setIsLoggedIn(true);

      // Initialize chat service
      chatService.current = new ChatService();
      
      // Listen for connection changes BEFORE connecting
      chatService.current.onConnectionChange(setIsConnected);

      // Listen for new messages BEFORE connecting
      chatService.current.onMessage((message) => {
        console.log('Received message:', message);
        // Add all messages to state
        setMessages((prev) => [...prev, message]);
      });
      
      // Now connect to WebSocket
      await chatService.current.connect(member.memberId, 'MEMBER');
      console.log('WebSocket connection established for member:', member.memberId);

      // Load admins
      const adminsData = await apiService.getAdmins();
      setAdmins(adminsData.filter((admin: Admin) => admin.active));

    } catch (error) {
      console.error('Login failed:', error);
      setLoginError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async (admin: Admin) => {
    setLoading(true);
    try {
      const history = await chatApi.getChatHistory(
        memberId,
        'MEMBER',
        admin.id.toString(),
        'ADMIN'
      );
      setMessages(history);
      
      // Mark messages as read
      await chatApi.markAsRead(memberId, 'MEMBER', admin.id.toString(), 'ADMIN');
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedAdmin || !chatService.current) {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasSelectedAdmin: !!selectedAdmin, 
        hasChatService: !!chatService.current,
        isConnected 
      });
      return;
    }

    try {
      console.log('Sending message:', {
        senderType: 'MEMBER',
        senderId: memberId,
        senderName: memberName,
        receiverType: 'ADMIN',
        receiverId: selectedAdmin.id.toString(),
        receiverName: selectedAdmin.name,
        message: newMessage.trim(),
      });
      
      chatService.current.sendMessage({
        senderType: 'MEMBER',
        senderId: memberId,
        senderName: memberName,
        receiverType: 'ADMIN',
        receiverId: selectedAdmin.id.toString(),
        receiverName: selectedAdmin.name,
        message: newMessage.trim(),
      });
      
      setNewMessage('');
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please check your connection.');
    }
  };

  const handleLogout = () => {
    chatService.current?.disconnect();
    setIsLoggedIn(false);
    setMemberEmail('');
    setMemberId('');
    setMemberName('');
    setAdmins([]);
    setSelectedAdmin(null);
    setMessages([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">💬</div>
            <h1 className="text-2xl font-bold text-gray-800">Member Chat</h1>
            <p className="text-sm text-gray-600 mt-2">Connect with library admins</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your email
              </label>
              <input
                type="email"
                id="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full  text-black placeholder-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {loginError && (
              <div className="text-red-500 text-sm">{loginError}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg mb-4 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Chat with Admins</h1>
            <p className="text-sm text-gray-600">Welcome, {memberName}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Admins List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Available Admins</h2>
              <div className="flex items-center mt-2">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <button
                  key={admin.id}
                  onClick={() => setSelectedAdmin(admin)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedAdmin?.id === admin.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{admin.name}</div>
                  <div className="text-sm text-gray-500">{admin.email}</div>
                  {admin.lastLogin && (
                    <div className="text-xs text-gray-400 mt-1">
                      Last seen: {new Date(admin.lastLogin).toLocaleDateString()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedAdmin ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">{selectedAdmin.name}</h3>
                  <p className="text-sm text-gray-600">{selectedAdmin.email}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {loading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  ) : messages.filter(msg =>
                      (msg.senderId === selectedAdmin.id.toString() && msg.senderType === 'ADMIN') ||
                      (msg.receiverId === selectedAdmin.id.toString() && msg.receiverType === 'ADMIN') ||
                      (msg.senderId === memberId && msg.senderType === 'MEMBER' && msg.receiverId === selectedAdmin.id.toString()) ||
                      (msg.receiverId === memberId && msg.receiverType === 'MEMBER' && msg.senderId === selectedAdmin.id.toString())
                    ).length === 0 ? (
                    <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
                  ) : (
                    messages.filter(msg =>
                      (msg.senderId === selectedAdmin.id.toString() && msg.senderType === 'ADMIN') ||
                      (msg.receiverId === selectedAdmin.id.toString() && msg.receiverType === 'ADMIN') ||
                      (msg.senderId === memberId && msg.senderType === 'MEMBER' && msg.receiverId === selectedAdmin.id.toString()) ||
                      (msg.receiverId === memberId && msg.receiverType === 'MEMBER' && msg.senderId === selectedAdmin.id.toString())
                    ).map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`flex ${message.senderType === 'MEMBER' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderType === 'MEMBER'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <div className="text-xs opacity-75 mb-1">{message.senderName}</div>
                          <div>{message.message}</div>
                          {message.timestamp && (
                            <div className="text-xs opacity-75 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
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
                      className="flex-1 px-4 py-2 border  text-black placeholder-gray-500 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!isConnected}
                    />
                    <button
                      type="submit"
                      disabled={!isConnected || !newMessage.trim()}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select an admin to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
