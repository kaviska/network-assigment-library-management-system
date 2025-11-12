'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatService, ChatMessage } from '../services/chatService'
import { apiService } from '../services/apiService'

interface Admin {
  id: number
  email: string
  name: string
}

interface MemberChatProps {
  memberId: string
  memberName: string
}

export default function MemberChat({ memberId, memberName }: MemberChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [admins, setAdmins] = useState<Admin[]>([])
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const chatService = useRef<ChatService | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeChat()
    return () => {
      if (chatService.current) {
        chatService.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChat = async () => {
    try {
      // Fetch available admins
      const adminList = await apiService.getAdmins()
      setAdmins(adminList)
      
      if (adminList.length > 0) {
        setSelectedAdmin(adminList[0]) // Select first admin by default
      }

      // Initialize chat service
      chatService.current = new ChatService()
      
      // Set up message handler
      chatService.current.onMessage((message: ChatMessage) => {
        setMessages(prev => [...prev, message])
      })

      // Set up connection handler
      chatService.current.onConnectionChange((connected: boolean) => {
        setIsConnected(connected)
      })

      // Connect to chat server
      if (chatService.current) {
        await chatService.current.connect(memberId, 'MEMBER')
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedAdmin || !chatService.current || !isConnected) {
      return
    }

    setIsSending(true)
    try {
      const message: ChatMessage = {
        senderType: 'MEMBER',
        senderId: memberId,
        senderName: memberName,
        receiverType: 'ADMIN',
        receiverId: selectedAdmin.id.toString(),
        receiverName: selectedAdmin.name,
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      }

      await chatService.current.sendMessage(message)
      setMessages(prev => [...prev, message])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return ''
    }
  }

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return ''
    try {
      const date = new Date(timestamp)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (date.toDateString() === today.toDateString()) {
        return 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday'
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        })
      }
    } catch {
      return ''
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [date: string]: ChatMessage[] }, message) => {
    const date = formatDate(message.timestamp)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4 animate-bounce">💬</div>
          <p className="text-gray-600">Connecting to chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 h-[600px] flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat with Library Staff</h2>
        <p className="text-gray-600">Get help and support from our library administrators</p>
      </div>

      {/* Connection Status */}
      <div className={`
        mb-4 px-3 py-2 rounded-lg text-sm font-medium
        ${isConnected 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
        }
      `}>
        <span className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {isConnected ? 'Connected to chat server' : 'Disconnected from chat server'}
        </span>
      </div>

      {/* Admin Selection */}
      {admins.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chat with:</label>
          <select
            value={selectedAdmin?.id || ''}
            onChange={(e) => {
              const admin = admins.find(a => a.id === parseInt(e.target.value))
              setSelectedAdmin(admin || null)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name} ({admin.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600">
                {selectedAdmin 
                  ? `Start a conversation with ${selectedAdmin.name}`
                  : 'Select an admin to start chatting'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="text-center my-4">
                    <span className="bg-white px-3 py-1 rounded-full text-sm text-gray-500 border border-gray-200">
                      {date}
                    </span>
                  </div>

                  {/* Messages for this date */}
                  {dayMessages.map((message, index) => (
                    <div
                      key={`${date}-${index}`}
                      className={`flex ${
                        message.senderType === 'MEMBER' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`
                          max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                          ${message.senderType === 'MEMBER'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                          }
                        `}
                      >
                        {message.senderType === 'ADMIN' && (
                          <div className="text-xs text-gray-500 mb-1">
                            {message.senderName}
                          </div>
                        )}
                        <div className="text-sm whitespace-pre-wrap">{message.message}</div>
                        <div className={`
                          text-xs mt-1
                          ${message.senderType === 'MEMBER' ? 'text-blue-100' : 'text-gray-500'}
                        `}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          {selectedAdmin ? (
            <div className="flex gap-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type a message to ${selectedAdmin.name}...`}
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={!isConnected || isSending}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected || isSending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>📤</span>
                )}
                Send
              </button>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Please select an admin to start chatting
            </div>
          )}
        </div>
      </div>

      {/* Chat Guidelines */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Chat Guidelines:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be respectful and courteous in your messages</li>
          <li>• Admins are available during library hours (9 AM - 6 PM)</li>
          <li>• For urgent issues, please call the library directly</li>
          <li>• Use this chat for book inquiries, account questions, and general support</li>
        </ul>
      </div>
    </div>
  )
}
