# Chat System Setup Guide

This guide explains how to set up and run the real-time chat system between admins and members.

## Architecture Overview

The chat system consists of:
1. **Database**: MySQL database storing chat messages
2. **Backend WebSocket Server**: Real-time message delivery (Port 8081)
3. **Backend REST API**: HTTP endpoints for chat history and user data (Port 8080)
4. **Frontend**: React/Next.js interface for both admins and members

## Database Setup

1. **Run the updated schema** to create the `chat_messages` table:
   ```bash
   mysql -u root -p oaktown_library < backend/src/main/resources/schema.sql
   ```

   Or manually execute the chat_messages table creation:
   ```sql
   USE oaktown_library;
   
   CREATE TABLE chat_messages (
       id INT AUTO_INCREMENT PRIMARY KEY,
       sender_type ENUM('ADMIN', 'MEMBER') NOT NULL,
       sender_id VARCHAR(50) NOT NULL,
       sender_name VARCHAR(100) NOT NULL,
       receiver_type ENUM('ADMIN', 'MEMBER') NOT NULL,
       receiver_id VARCHAR(50) NOT NULL,
       receiver_name VARCHAR(100) NOT NULL,
       message TEXT NOT NULL,
       timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       is_read BOOLEAN DEFAULT FALSE,
       INDEX idx_sender (sender_type, sender_id),
       INDEX idx_receiver (receiver_type, receiver_id),
       INDEX idx_conversation (sender_id, receiver_id),
       INDEX idx_timestamp (timestamp)
   );
   ```

## Backend Setup

### 1. Start the REST API Server (Port 8080)

Navigate to the backend directory and run:

```bash
cd backend
mvn clean compile
java -cp "target/classes;target/dependency/*" com.oaktown.library.RestApiServer
```

This server provides:
- `/api/members` - List all members
- `/api/auth/admins` - List all admins
- `/api/chat/history` - Get chat history between two users
- `/api/chat/read` - Mark messages as read

### 2. Start the WebSocket Chat Server (Port 8081)

In a **new terminal**, run:

```bash
cd backend
java -cp "target/classes;target/dependency/*" com.oaktown.library.WebSocketChatServer
```

This server handles:
- Real-time message delivery via WebSocket
- Client registration (admin/member identification)
- Message broadcasting

## Frontend Setup

### 1. Install Dependencies (if not already done)

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

### For Admins

1. **Login** at `http://localhost:3000`
   - Use your admin credentials

2. **Navigate to Chat**
   - Click the "Chat 💬" tab in the navigation menu
   - The chat interface is integrated into the admin dashboard

3. **Select a Member**
   - Click on any member from the left sidebar
   - View chat history
   - Send real-time messages

### For Members

1. **Open Member Chat** at `http://localhost:3000/member-chat`

2. **Login with Email**
   - Enter your registered email address
   - System will identify you automatically

3. **Select an Admin**
   - Click on any active admin from the list
   - View chat history
   - Send real-time messages

## How It Works

### Message Flow

1. **Sending a Message**:
   - User types message in the UI
   - Frontend sends via WebSocket (if connected)
   - WebSocket server saves to database
   - Message delivered to recipient in real-time (if online)

2. **Loading History**:
   - User selects a conversation
   - Frontend makes HTTP GET request to `/api/chat/history`
   - Backend queries database for conversation
   - Messages displayed in chronological order

3. **Real-time Updates**:
   - Both users connect to WebSocket server
   - Server maintains connection mapping (userId:userType -> SocketChannel)
   - New messages broadcast to connected recipients instantly

### Key Components

**Backend:**
- `ChatMessage.java` - Message model
- `ChatMessageDAO.java` - Database operations
- `WebSocketChatServer.java` - Real-time messaging
- `RestApiServer.java` - HTTP endpoints (ChatHandler class)

**Frontend:**
- `chatService.ts` - WebSocket client & HTTP API
- `AdminChat.tsx` - Admin chat component
- `app/chat/page.tsx` - Admin chat page
- `app/member-chat/page.tsx` - Member chat page

## Troubleshooting

### WebSocket Connection Issues

If you see "Disconnected" status:

1. **Check if WebSocket server is running**:
   ```bash
   netstat -an | findstr "8081"
   ```

2. **Check browser console** for connection errors

3. **Verify firewall** isn't blocking port 8081

### Database Issues

If messages aren't saving:

1. **Verify table exists**:
   ```sql
   USE oaktown_library;
   SHOW TABLES LIKE 'chat_messages';
   ```

2. **Check database connection** in backend console

### API Issues

If chat history doesn't load:

1. **Check REST API is running** on port 8080
2. **Test endpoint manually**:
   ```bash
   curl "http://localhost:8080/api/chat/history?userId1=M001&userType1=MEMBER&userId2=1&userType2=ADMIN"
   ```

## Features

✅ Real-time bidirectional messaging
✅ Message persistence in database
✅ Chat history loading
✅ Online/offline status indicators
✅ Message read receipts
✅ Automatic reconnection
✅ Multiple simultaneous conversations
✅ Member identification via email
✅ Admin authentication

## Future Enhancements

- Message notifications
- Typing indicators
- File/image sharing
- Message search
- Conversation archiving
- Push notifications
- Mobile responsive improvements

## API Reference

### WebSocket Messages

**Register Client:**
```json
{
  "type": "register",
  "userId": "M001",
  "userType": "MEMBER"
}
```

**Send Message:**
```json
{
  "type": "message",
  "senderType": "MEMBER",
  "senderId": "M001",
  "senderName": "John Doe",
  "receiverType": "ADMIN",
  "receiverId": "1",
  "receiverName": "Admin User",
  "message": "Hello!"
}
```

### HTTP Endpoints

**Get Chat History:**
```
GET /api/chat/history?userId1=M001&userType1=MEMBER&userId2=1&userType2=ADMIN
```

**Mark Messages as Read:**
```
POST /api/chat/read
Content-Type: application/json

{
  "receiverId": "M001",
  "receiverType": "MEMBER",
  "senderId": "1",
  "senderType": "ADMIN"
}
```
