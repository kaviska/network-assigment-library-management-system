# OakTown Library Management System - Frontend

A modern, user-friendly web interface for the OakTown Library Management System, built with Next.js, React, and Tailwind CSS.

## Features

### 📊 Dashboard
- **Library Statistics**: View real-time statistics including total items, available items, borrowed items, and member counts
- **Item Type Breakdown**: Visual breakdown of books, reference books, and magazines
- **Quick Actions**: Easy access to common operations

### 📚 Library Items Management
- **Browse All Items**: View all library items with detailed information
- **Search Functionality**: Search items by title, author, or ISBN
- **Item Details**: See item type, availability status, publication year, and specific details
- **Remove Items**: Remove items from the library (with confirmation)
- **Real-time Status**: Visual indicators for available/borrowed items

### 👥 Members Management
- **Browse All Members**: View all registered library members
- **Search Members**: Search by name, member ID, or email
- **Member Details**: View complete member information including contact details and registration date
- **Active Status**: Visual indicators for active/inactive members

### 📋 Borrowing Management
- **Information Center**: Learn about borrowing policies and procedures
- **Borrowing Forms**: Interface for borrowing operations (requires console application)
- **Return Forms**: Interface for return operations (requires console application)
- **Cost Information**: Display of daily costs and borrowing periods

## Technology Stack

- **Frontend Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4
- **TypeScript**: Full type safety
- **API Communication**: Custom API service with error handling
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Java backend server running on port 8080

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

### Backend Connection

The frontend connects to the Java backend REST API running on `http://localhost:8080`. Make sure the backend server is running before using the web interface.

To start the backend server:
```bash
cd backend
mvn compile exec:java -Dexec.mainClass="com.oaktown.library.RestApiServer"
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with the pure Java backend through a RESTful API:

- **GET** `/api/items` - Get all library items
- **GET** `/api/items/{isbn}` - Get item by ISBN
- **DELETE** `/api/items/{isbn}` - Remove item
- **GET** `/api/members` - Get all members
- **GET** `/api/members/{id}` - Get member by ID
- **GET** `/api/stats` - Get library statistics

## Features Overview

### Dashboard
- Real-time library statistics
- Quick navigation to different sections
- Visual data representation

### Items Management
- Complete CRUD operations for library items
- Advanced search and filtering
- Responsive item cards with detailed information

### Members Management
- Member directory with search capabilities
- Detailed member profiles
- Status tracking

### Borrowing System
- Information about borrowing policies
- Integration points for borrowing/returning (console app required)
- Cost calculation display

## Responsive Design

The interface is fully responsive and works on:
- **Desktop**: Full feature set with multi-column layouts
- **Tablet**: Adapted layouts with touch-friendly controls
- **Mobile**: Optimized single-column layouts with collapsible navigation

## Error Handling

- **Connection Errors**: Clear messages when backend is unavailable
- **API Errors**: Specific error messages for different failure cases
- **Retry Functionality**: Easy retry buttons for failed operations
- **Loading States**: Visual feedback during data loading

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Notes

### Current Limitations
- Adding new items requires the console application
- Adding new members requires the console application
- Borrowing/returning operations require the console application
- These limitations maintain the pure Java backend architecture

### Future Enhancements
- Modal dialogs for detailed item/member views
- Advanced filtering and sorting options
- Export functionality for reports
- Real-time updates using WebSockets
- Print-friendly layouts

## Troubleshooting

### Common Issues

1. **"Unable to connect to the library system"**
   - Ensure the Java backend server is running on port 8080
   - Check that the database connection is working

2. **Items/Members not loading**
   - Verify the backend REST API endpoints are accessible
   - Check browser console for detailed error messages

3. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS rules

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify the backend server is running and responding
3. Ensure all dependencies are properly installed
4. Check the network tab in developer tools for API call failures

## Contributing

To contribute to the frontend development:
1. Follow the existing code structure and naming conventions
2. Use TypeScript for type safety
3. Implement proper error handling
4. Ensure responsive design
5. Add appropriate loading states and user feedback