'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatService, ChatMessage, chatApi, fileApi, ChatFile } from '../services/chatService';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileInfoCache, setFileInfoCache] = useState<Record<number, ChatFile | null>>({});
  
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

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !selectedAdmin || !chatService.current) {
      return;
    }

    setUploadingFile(true);
    
    try {
      // Upload file
      const uploadResult = await fileApi.uploadFile(
        selectedFile,
        memberId,
        'MEMBER',
        `File sent to ${selectedAdmin.name}`
      );

      if (uploadResult.success) {
        // Send file message through WebSocket
        const fileMessage = {
          senderType: 'MEMBER' as const,
          senderId: memberId,
          senderName: memberName,
          receiverType: 'ADMIN' as const,
          receiverId: selectedAdmin.id.toString(),
          receiverName: selectedAdmin.name,
          message: `📎 ${selectedFile.name} (${fileApi.formatFileSize(selectedFile.size)})`,
          fileId: uploadResult.fileId,
          messageType: 'FILE' as const,
        };

        chatService.current.sendMessage(fileMessage);
        
        // Reset file upload state
        setSelectedFile(null);
        setShowFileUpload(false);
        
        console.log('File uploaded and message sent successfully');
      } else {
        alert(`File upload failed: ${uploadResult.message}`);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const getFileInfoCached = async (fileId: number) => {
    try {
      // Check if we have cached info
      if (fileInfoCache[fileId] !== undefined) {
        return fileInfoCache[fileId];
      }

      // Fetch file info and cache it
      const info = await fileApi.getFileInfo(fileId);
      setFileInfoCache((s) => ({ ...s, [fileId]: info }));
      return info;
    } catch (error) {
      console.error('Failed to get file info:', error);
      // cache as null to avoid refetch storms
      setFileInfoCache((s) => ({ ...s, [fileId]: null }));
      return null;
    }
  };

  const handleFileDownload = async (fileId: number, fileName: string) => {
    try {
      // Fetch file metadata to obtain the original filename if available
      let downloadName = fileName;
      try {
        const info = await fileApi.getFileInfo(fileId);
        if (info && info.originalFileName) {
          downloadName = info.originalFileName;
        }
      } catch (err) {
        // ignore metadata errors and fall back to provided name
      }

      const blob = await fileApi.downloadFile(fileId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = downloadName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('File download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleFileView = async (fileId: number) => {
    try {
      const info = await fileApi.getFileInfo(fileId);
      const blob = await fileApi.downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      
      // Check if it's an image or PDF - open in new tab
      const fileType = info.fileType.toLowerCase();
      const isImage = fileType.startsWith('image/');
      const isPdf = fileType.toLowerCase() === 'pdf';
      
      if (isImage || isPdf) {
        window.open(url, '_blank');
      } else {
        // For other file types, just trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = info.originalFileName || 'file';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('File view failed:', error);
      alert('Cannot preview this file type. Try downloading instead.');
    }
  };

  // Helper function to find fileId by filename
  const findFileByName = async (fileName: string, messageTimestamp?: string) => {
    try {
      // Get list of all files
      const response = await fetch('http://localhost:8080/api/files/list');
      if (!response.ok) {
        throw new Error('Failed to fetch file list');
      }
      const files = await response.json();
      
      // Try to find file by exact filename match first
      let matchedFile = files.find((file: any) => 
        file.originalFileName === fileName || file.fileName === fileName
      );
      
      // If no exact match, try partial match
      if (!matchedFile) {
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '');
        matchedFile = files.find((file: any) => {
          const cleanOriginal = file.originalFileName?.replace(/[^a-zA-Z0-9.]/g, '') || '';
          const cleanStored = file.fileName?.replace(/[^a-zA-Z0-9.]/g, '') || '';
          return cleanOriginal.includes(cleanFileName) || cleanStored.includes(cleanFileName);
        });
      }
      
      return matchedFile?.id || null;
    } catch (error) {
      console.error('Error finding file by name:', error);
      return null;
    }
  };

  // Extract filename from file message
  const extractFileName = (message: string) => {
    // Match pattern like "📎 filename.ext (size)"
    const match = message.match(/📎\s+(.+?)\s+\(/);
    return match ? match[1].trim() : null;
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isMember = message.senderType === 'MEMBER';
    const isFileMessage = message.messageType === 'FILE' || message.message.includes('📎') || message.fileId;
    
    return (
      <div
        key={message.id || index}
        className={`flex ${isMember ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isMember
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-800 border border-gray-200'
          }`}
        >
          <div className="text-xs opacity-75 mb-1">{message.senderName}</div>
          
          {isFileMessage ? (
            <div className="space-y-2 max-w-md">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📎</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {message.fileId ? (
                      // show cached filename if available
                      (fileInfoCache[message.fileId] && fileInfoCache[message.fileId]!.originalFileName) || message.message
                    ) : (
                      message.message
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.fileId && fileInfoCache[message.fileId]
                      ? `${fileApi.formatFileSize(fileInfoCache[message.fileId]!.fileSize)} • ${fileInfoCache[message.fileId]!.fileType}`
                      : 'File attachment'}
                  </div>
                </div>
              </div>
              {/* Always show buttons for file messages */}
              <div className="flex gap-2 mt-2">
                {message.fileId ? (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          const info = await getFileInfoCached(message.fileId!);
                          if (!info) throw new Error('File not found');
                          await handleFileDownload(message.fileId!, info.originalFileName || message.message);
                        } catch (err: any) {
                          console.error('Download error:', err);
                          alert(err?.message || 'File not available');
                        }
                      }}
                      className={`text-xs px-3 py-1 rounded transition-colors ${
                        isMember 
                          ? 'bg-blue-400 hover:bg-blue-300 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      ⬇️ Download
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await handleFileView(message.fileId!);
                        } catch (err: any) {
                          console.error('View error:', err);
                          alert(err?.message || 'Cannot preview this file');
                        }
                      }}
                      className={`text-xs px-3 py-1 rounded transition-colors ${
                        isMember 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                          : 'bg-gray-400 hover:bg-gray-500 text-white'
                      }`}
                    >
                      👁️ View
                    </button>
                  </>
                ) : isFileMessage ? (
                  // For file messages without fileId, try to find and download by filename
                  <button
                    onClick={async () => {
                      try {
                        const fileName = extractFileName(message.message);
                        if (!fileName) {
                          throw new Error('Could not extract filename from message');
                        }
                        
                        console.log('Searching for file:', fileName);
                        const foundFileId = await findFileByName(fileName, message.timestamp);
                        
                        if (foundFileId) {
                          console.log('Found fileId:', foundFileId);
                          await handleFileDownload(foundFileId, fileName);
                        } else {
                          throw new Error(`File "${fileName}" not found in uploaded files`);
                        }
                      } catch (err: any) {
                        console.error('Download error:', err);
                        alert(err?.message || 'File not available');
                      }
                    }}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      isMember 
                        ? 'bg-green-500 hover:bg-green-400 text-white' 
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    Download
                  </button>
                ) : (
                  <button disabled className="text-xs px-3 py-1 rounded bg-gray-300 text-gray-500">
                    File not available
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="wrap-break-word">{message.message}</div>
          )}
          
          {message.timestamp && (
            <div className="text-xs opacity-75 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    );
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
                    ).map((message, index) => renderMessage(message, index))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  {showFileUpload && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Upload File</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setShowFileUpload(false);
                            setSelectedFile(null);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                      <form onSubmit={handleFileUpload} className="space-y-3">
                        <input
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          disabled={uploadingFile}
                        />
                        {selectedFile && (
                          <div className="text-sm text-gray-600">
                            📎 {selectedFile.name} ({fileApi.formatFileSize(selectedFile.size)})
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            disabled={!selectedFile || uploadingFile}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                          >
                            {uploadingFile ? 'Uploading...' : 'Upload & Send'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowFileUpload(false);
                              setSelectedFile(null);
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  <form onSubmit={handleSendMessage} className="space-y-2">
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
                        type="button"
                        onClick={() => setShowFileUpload(true)}
                        disabled={!isConnected || showFileUpload}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                        title="Attach File"
                      >
                        📎
                      </button>
                      <button
                        type="submit"
                        disabled={!isConnected || !newMessage.trim()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Send
                      </button>
                    </div>
                    {!isConnected && (
                      <p className="text-xs text-red-500">⚠️ Not connected to chat server</p>
                    )}
                  </form>
                </div>
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
