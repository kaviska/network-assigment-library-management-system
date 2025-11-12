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
  fileId?: number;
  messageType?: 'TEXT' | 'FILE';
}

export interface ChatFile {
  id: number;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploaderType: 'ADMIN' | 'MEMBER';
  uploadDate: string;
  active: boolean;
  description?: string;
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

// File API for file sharing
export const fileApi = {
  async uploadFile(
    file: File,
    uploaderId: string,
    uploaderType: 'ADMIN' | 'MEMBER',
    description?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1]; // Remove data:type;base64, prefix
          
          const response = await fetch('http://localhost:8080/api/files/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: file.name,
              fileData: base64Data,
              uploaderId,
              uploaderType,
              description,
            }),
          });

          const result = await response.json();
          if (!response.ok) {
            // Surface backend error message when available
            const msg = result && result.message ? result.message : 'Failed to upload file';
            throw new Error(msg);
          }

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  },

  async downloadFile(fileId: number): Promise<Blob> {
    const response = await fetch(`http://localhost:8080/api/files/download/${fileId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  },

  async getFileInfo(fileId: number): Promise<ChatFile> {
    const response = await fetch(`http://localhost:8080/api/files/${fileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get file info');
    }

    return response.json();
  },

  async listFiles(uploaderId?: string, uploaderType?: 'ADMIN' | 'MEMBER'): Promise<ChatFile[]> {
    let url = 'http://localhost:8080/api/files/list';
    if (uploaderId && uploaderType) {
      url += `?uploaderId=${uploaderId}&uploaderType=${uploaderType}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to list files');
    }

    return response.json();
  },

  async deleteFile(fileId: number): Promise<any> {
    const response = await fetch(`http://localhost:8080/api/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    return response.json();
  },

  // Helper function to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Helper function to get file icon based on file type
  getFileIcon(fileType: string): string {
    const type = fileType.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(type)) {
      return '🖼️';
    } else if (['pdf'].includes(type)) {
      return '📄';
    } else if (['doc', 'docx'].includes(type)) {
      return '📝';
    } else if (['xls', 'xlsx'].includes(type)) {
      return '📊';
    } else if (['ppt', 'pptx'].includes(type)) {
      return '📈';
    } else if (['txt'].includes(type)) {
      return '📃';
    } else if (['zip', 'rar', '7z'].includes(type)) {
      return '📦';
    } else if (['mp3', 'wav', 'ogg'].includes(type)) {
      return '🎵';
    } else if (['mp4', 'avi', 'mov'].includes(type)) {
      return '🎬';
    } else {
      return '📎';
    }
  },
};
