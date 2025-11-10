# OakTown Library Management System - Complete Setup Guide

This guide will help you set up and run the complete OakTown Library Management System with both the pure Java backend and the modern React frontend.

## System Architecture

```
┌─────────────────┐    HTTP/REST API    ┌──────────────────┐
│   React Frontend │ ◄─────────────────► │   Java Backend   │
│   (Port 3000)    │                     │   (Port 8080)    │
└─────────────────┘                     └──────────────────┘
                                                │
                                                ▼
                                        ┌──────────────────┐
                                        │  MySQL Database  │
                                        │   (Port 3306)    │
                                        └──────────────────┘
```

## Prerequisites

### Required Software
- **Java 11+** (for backend)
- **Maven 3.6+** (for Java build management)
- **Node.js 18+** (for frontend)
- **npm or yarn** (for frontend package management)
- **MySQL 8.0+** (for database)

### Verify Installation
```bash
# Check Java version
java -version

# Check Maven version
mvn -version

# Check Node.js version
node -version

# Check npm version
npm -version

# Check MySQL (if installed)
mysql --version
```

## Database Setup

### 1. Create Database
```sql
CREATE DATABASE oaktown_library;
USE oaktown_library;
```

### 2. Create Tables
Run the SQL scripts located in `backend/src/main/resources/`:
- `schema.sql` - Creates the database structure
- `sample_data.sql` - Inserts sample data

### 3. Configure Database Connection
Edit `backend/src/main/resources/config.properties`:
```properties
# Database Configuration
db.url=jdbc:mysql://localhost:3306/oaktown_library
db.username=your_username
db.password=your_password
db.driver=com.mysql.cj.jdbc.Driver
```

## Backend Setup (Pure Java)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
mvn clean compile
```

### 3. Test Database Connection
```bash
mvn exec:java -Dexec.mainClass="com.oaktown.library.App"
```
This will start the console application and test the database connection.

### 4. Start REST API Server
```bash
mvn exec:java -Dexec.mainClass="com.oaktown.library.RestApiServer"
```

The backend server will start on `http://localhost:8080` with the following endpoints:
- `GET /api/items` - Get all library items
- `GET /api/items/{isbn}` - Get item by ISBN
- `DELETE /api/items/{isbn}` - Remove item
- `GET /api/members` - Get all members
- `GET /api/members/{id}` - Get member by ID
- `GET /api/stats` - Get library statistics

## Frontend Setup (React/Next.js)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Running the Complete System

### Step 1: Start Database
Ensure MySQL is running with the `oaktown_library` database created.

### Step 2: Start Backend (Terminal 1)
```bash
cd backend
mvn exec:java -Dexec.mainClass="com.oaktown.library.RestApiServer"
```

Wait for the message: "Server started on http://localhost:8080"

### Step 3: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Wait for the message: "Ready - started server on 0.0.0.0:3000"

### Step 4: Access the System
1. **Web Interface**: Open `http://localhost:3000` in your browser
2. **Console Application**: Use the backend terminal for full CRUD operations

## System Features

### Web Interface Features
✅ **Dashboard**: View library statistics and quick actions  
✅ **Browse Items**: View all library items with search functionality  
✅ **Browse Members**: View all library members with search functionality  
✅ **Remove Items**: Delete items through the web interface  
✅ **Responsive Design**: Works on desktop, tablet, and mobile  
✅ **Error Handling**: Clear error messages and retry options  

### Console Application Features
✅ **Add Items**: Add books, magazines, and reference books  
✅ **Add Members**: Register new library members  
✅ **Borrow Items**: Process borrowing transactions  
✅ **Return Items**: Process return transactions  
✅ **View Reports**: Detailed borrowing history and overdue items  

## API Endpoints Reference

### Library Items
- `GET /api/items` - List all items
- `GET /api/items/search?keyword={term}` - Search items
- `GET /api/items/{isbn}` - Get specific item
- `DELETE /api/items/{isbn}` - Remove item

### Members
- `GET /api/members` - List all members
- `GET /api/members/{id}` - Get specific member

### Statistics
- `GET /api/stats` - Get library statistics

### CORS Configuration
The backend automatically includes CORS headers for `http://localhost:3000`

## Troubleshooting

### Backend Issues

**Database Connection Failed**
```
Solution: Check MySQL is running and credentials are correct in config.properties
```

**Port 8080 Already in Use**
```
Solution: Kill the process using port 8080 or change the port in RestApiServer.java
```

**Maven Build Errors**
```
Solution: Ensure Java 11+ is installed and JAVA_HOME is set correctly
```

### Frontend Issues

**Cannot Connect to Backend**
```
Solution: Ensure backend server is running on port 8080
```

**npm Install Errors**
```
Solution: Delete node_modules and package-lock.json, then run npm install again
```

**Port 3000 Already in Use**
```
Solution: Kill the process or start with: npm run dev -- -p 3001
```

### Common Solutions

1. **Check Ports**:
   ```bash
   # Check what's running on port 8080
   netstat -an | findstr :8080
   
   # Check what's running on port 3000
   netstat -an | findstr :3000
   ```

2. **Restart Services**:
   - Stop both frontend and backend
   - Restart backend first, then frontend

3. **Clear Caches**:
   ```bash
   # Backend
   mvn clean
   
   # Frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

## Development Workflow

### For Backend Development
1. Make changes to Java files
2. Restart the REST API server
3. Test changes through the web interface or API calls

### For Frontend Development
1. Make changes to React components
2. Changes will hot-reload automatically
3. Test in the browser at localhost:3000

## Production Deployment

### Backend
```bash
mvn clean package
java -jar target/library-management-1.0.0.jar
```

### Frontend
```bash
npm run build
npm run start
```

## Technology Stack Summary

### Backend (Pure Java)
- **Language**: Java 11+
- **Build Tool**: Maven
- **HTTP Server**: com.sun.net.httpserver.HttpServer (built-in)
- **JSON Processing**: Jackson
- **Database**: MySQL with JDBC
- **Architecture**: Layered (DAO, Service, Model)

### Frontend (Modern Web)
- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **API Client**: Custom service with fetch API
- **Responsive**: Mobile-first design

This setup provides you with a complete, modern library management system while keeping the backend technology as pure Java without frameworks like Spring Boot.