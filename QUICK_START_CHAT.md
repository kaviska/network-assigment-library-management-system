# Quick Start Guide - Chat System

## Prerequisites
- MySQL running on localhost
- Java 8+ installed
- Node.js 16+ installed
- Maven installed

## Step 1: Database Setup (One-time)

Open MySQL and run:

```sql
USE oaktown_library;

CREATE TABLE IF NOT EXISTS chat_messages (
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

## Step 2: Start Backend Servers

### Terminal 1 - REST API Server (Port 8080)
```bash
cd backend
mvn clean compile
mvn dependency:copy-dependencies -DoutputDirectory=target/dependency
java -cp "target/classes;target/dependency/*" com.oaktown.library.RestApiServer
```

### Terminal 2 - WebSocket Chat Server (Port 8081)
```bash
cd backend
java -cp "target/classes;target/dependency/*" com.oaktown.library.WebSocketChatServer
```

## Step 3: Start Frontend

### Terminal 3 - Next.js Frontend (Port 3000)
```bash
cd frontend
npm install  # First time only
npm run dev
```

## Access the Application

### Admin Interface
1. Go to: `http://localhost:3000`
2. Login with admin credentials
3. Click the **"Chat 💬"** tab in the navigation
4. Select a member from the list to start chatting

### Member Interface
1. Go to: `http://localhost:3000/member-chat`
2. Enter your registered email address
3. Select an admin to chat with

## Verify Everything is Running

Check these URLs:
- ✅ REST API: `http://localhost:8080/api/stats` (should return JSON)
- ✅ Frontend: `http://localhost:3000` (should show login page)
- ✅ WebSocket: Check Terminal 2 for "WebSocket Chat Server started on port 8081"

## Troubleshooting

### "Failed to connect to database"
- Make sure MySQL is running
- Check credentials in `backend/src/main/resources/config.properties`

### "WebSocket Disconnected"
- Verify Terminal 2 is running the WebSocket server
- Check if port 8081 is available: `netstat -an | findstr "8081"`

### "Member not found with this email"
- The member must be registered in the system first
- Use the admin dashboard to add members before they can chat

### Build errors in frontend
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Make sure you're in the `frontend` directory

## Sample Test Flow

1. **As Admin:**
   - Login → Navigate to Members tab
   - Add a test member (e.g., email: test@example.com)
   - Go to Chat tab
   - Select the test member
   - Send a message: "Welcome to OakTown Library!"

2. **As Member:**
   - Open `http://localhost:3000/member-chat` in a new browser window/incognito
   - Login with: test@example.com
   - Select any admin
   - Reply with: "Thank you!"

3. **Verify:**
   - Both windows should show messages instantly
   - Messages persist after refresh
   - Connection indicator shows green dot

## Stopping the Application

Press `Ctrl+C` in each terminal to stop:
1. WebSocket server (Terminal 2)
2. REST API server (Terminal 1)
3. Frontend (Terminal 3)

## What's Next?

After successfully running the chat system, you can:
- Add more members through the admin dashboard
- Test multiple simultaneous conversations
- Check the database to see stored messages: `SELECT * FROM chat_messages;`
- Customize the UI styling in the React components
