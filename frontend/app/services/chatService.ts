// Chat Service for WebSocket communication

export interface ChatMessage {
  id?: number;
  senderType: 'ADMIN' | 'MEMBER';
  senderId: string;
  senderName: string;
  receiverType: 'ADMIN' | 'MEMBER';
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp?: string;
  isRead?: boolean;
}

export class ChatService {
  private ws: WebSocket | null = null;
  private messageHandlers: Array<(message: ChatMessage) => void> = [];
  private connectionHandlers: Array<(connected: boolean) => void> = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private wsUrl: string = 'ws://localhost:8081') {}

  connect(userId: string, userType: 'ADMIN' | 'MEMBER'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          
          // Register with server
          this.send({
            type: 'register',
            userId,
            userType,
          });

          this.notifyConnectionHandlers(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'registered') {
              console.log('Successfully registered with chat server');
            } else if (data.type === 'message') {
              const message: ChatMessage = {
                id: data.id,
                senderType: data.senderType,
                senderId: data.senderId,
                senderName: data.senderName,
                receiverType: data.receiverType,
                receiverId: data.receiverId,
                receiverName: data.receiverName,
                message: data.message,
                timestamp: data.timestamp,
                isRead: data.isRead,
              };
              this.notifyMessageHandlers(message);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.notifyConnectionHandlers(false);
          this.attemptReconnect(userId, userType);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(userId: string, userType: 'ADMIN' | 'MEMBER') {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect(userId, userType).catch(console.error);
      }, delay);
    }
  }

  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        type: 'message',
        ...message,
      });
    } else {
      console.error('WebSocket is not connected');
      throw new Error('WebSocket is not connected');
    }
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  onMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onConnectionChange(handler: (connected: boolean) => void) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter((h) => h !== handler);
    };
  }

  private notifyMessageHandlers(message: ChatMessage) {
    this.messageHandlers.forEach((handler) => handler(message));
  }

  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach((handler) => handler(connected));
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// HTTP API for chat history
export const chatApi = {
  async getChatHistory(
    userId1: string,
    userType1: 'ADMIN' | 'MEMBER',
    userId2: string,
    userType2: 'ADMIN' | 'MEMBER'
  ): Promise<ChatMessage[]> {
    const response = await fetch(
      `http://localhost:8080/api/chat/history?userId1=${userId1}&userType1=${userType1}&userId2=${userId2}&userType2=${userType2}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }

    return response.json();
  },

  async markAsRead(
    receiverId: string,
    receiverType: 'ADMIN' | 'MEMBER',
    senderId: string,
    senderType: 'ADMIN' | 'MEMBER'
  ): Promise<void> {
    const response = await fetch('http://localhost:8080/api/chat/read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiverId,
        receiverType,
        senderId,
        senderType,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark messages as read');
    }
  },
};
