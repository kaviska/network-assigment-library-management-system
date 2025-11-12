package com.oaktown.library;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.oaktown.library.dao.ChatMessageDAO;
import com.oaktown.library.dao.ChatFileDAO;
import com.oaktown.library.model.ChatMessage;
import com.oaktown.library.model.ChatFile;
import com.oaktown.library.service.AuthService;
import com.oaktown.library.service.Library;
import com.oaktown.library.service.FTPFileService;
import com.oaktown.library.util.DatabaseConnection;
import com.oaktown.library.util.SessionManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

/**
 * Pure Java HTTP REST API server for the OakTown Library Management System.
 * Uses Java's built-in com.sun.net.httpserver.HttpServer.
 */
public class RestApiServer {
    
    private final Library library;
    private final AuthService authService;
    private final ChatMessageDAO chatMessageDAO;
    private final ChatFileDAO chatFileDAO;
    private final FTPFileService ftpFileService;
    private final ObjectMapper objectMapper;
    private HttpServer server;
    
    public RestApiServer() {
        this.library = new Library();
        this.authService = new AuthService();
        this.chatMessageDAO = new ChatMessageDAO();
        this.chatFileDAO = new ChatFileDAO();
        this.ftpFileService = new FTPFileService();
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }
    
    public static void main(String[] args) {
        System.out.println("=== OakTown Library Management System REST API ===");
        System.out.println("Starting pure Java REST API server...");
        
        // Test database connection
        DatabaseConnection dbConn = DatabaseConnection.getInstance();
        if (!dbConn.testConnection()) {
            System.err.println("Failed to connect to database. Please check your configuration.");
            System.err.println("Make sure MySQL is running and the database 'oaktown_library' exists.");
            return;
        }
        
        System.out.println("Database connection successful!");
        
        RestApiServer apiServer = new RestApiServer();
        try {
            apiServer.start();
        } catch (Exception e) {
            System.err.println("Failed to start server: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public void start() throws IOException {
        // Create HTTP server on port 8080
        server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // Add CORS headers to all responses
        server.createContext("/api/", new CorsHandler());
        
        // API endpoints
        server.createContext("/api/auth", new AuthHandler());
        server.createContext("/api/items", new ItemsHandler());
        server.createContext("/api/members", new MembersHandler());
        server.createContext("/api/borrowings", new BorrowingsHandler());
        server.createContext("/api/stats", new StatsHandler());
        server.createContext("/api/chat", new ChatHandler());
        server.createContext("/api/files", new FileHandler());
        
        // Set executor to null (uses default)
        server.setExecutor(null);
        
        // Start the server
        server.start();
        
        System.out.println("Server started on http://localhost:8080");
        System.out.println("API endpoints available:");
        System.out.println("  POST   /api/auth/login      - Admin login");
        System.out.println("  POST   /api/auth/logout     - Admin logout");
        System.out.println("  GET    /api/auth/profile    - Get admin profile");
        System.out.println("  GET    /api/auth/admins     - Get all admins");
        System.out.println("  POST   /api/auth/admins     - Create new admin");
        System.out.println("  PUT    /api/auth/admins/{id}/status - Update admin status");
        System.out.println("  GET    /api/items           - Get all library items");
        System.out.println("  GET    /api/items/search    - Search items by keyword");
        System.out.println("  GET    /api/items/{isbn}    - Get item by ISBN");
        System.out.println("  POST   /api/items           - Add new item (Book/Magazine/Reference Book)");
        System.out.println("  DELETE /api/items/{isbn}    - Remove item");
        System.out.println("  GET    /api/members         - Get all members");
        System.out.println("  GET    /api/members/{id}    - Get member by ID");
        System.out.println("  POST   /api/members         - Add new member");
        System.out.println("  PUT    /api/members/{id}    - Update member");
        System.out.println("  POST   /api/borrowings      - Borrow item");
        System.out.println("  PUT    /api/borrowings      - Return item");
        System.out.println("  GET    /api/borrowings/member/{id} - Get member's borrowing history");
        System.out.println("  GET    /api/stats           - Get library statistics");
        System.out.println("  GET    /api/chat/history    - Get chat history");
        System.out.println("  POST   /api/chat/read       - Mark messages as read");
        System.out.println("  POST   /api/files/upload    - Upload file");
        System.out.println("  GET    /api/files/download/{id} - Download file");
        System.out.println("  GET    /api/files/list      - List files");
        System.out.println("  GET    /api/files/{id}      - Get file info");
        System.out.println("  DELETE /api/files/{id}      - Delete file");
        System.out.println();
        System.out.println("Press Ctrl+C to stop the server.");
    }
    
    public void stop() {
        if (server != null) {
            server.stop(0);
            System.out.println("Server stopped.");
        }
    }
    
    /**
     * Handler for CORS support
     */
    private class CorsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Add CORS headers
            addCorsHeaders(exchange);
            
            // Handle preflight OPTIONS request
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            // For non-OPTIONS requests, return 404 as this is just CORS handling
            sendResponse(exchange, 404, "Not Found");
        }
    }
    
    /**
     * Handler for library items endpoints
     */
    private class ItemsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();
            
            try {
                switch (method) {
                    case "GET":
                        handleGetItems(exchange, path);
                        break;
                    case "POST":
                        handlePostItem(exchange);
                        break;
                    case "DELETE":
                        handleDeleteItem(exchange, path);
                        break;
                    default:
                        sendResponse(exchange, 405, "Method Not Allowed");
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, "Internal Server Error: " + e.getMessage());
            }
        }
        
        private void handleGetItems(HttpExchange exchange, String path) throws IOException {
            if (path.equals("/api/items")) {
                // Get all items
                String response = objectMapper.writeValueAsString(library.listAllItems());
                sendJsonResponse(exchange, 200, response);
            } else if (path.startsWith("/api/items/")) {
                String isbn = path.substring("/api/items/".length());
                var item = library.findItemByIsbn(isbn);
                if (item != null) {
                    String response = objectMapper.writeValueAsString(item);
                    sendJsonResponse(exchange, 200, response);
                } else {
                    sendResponse(exchange, 404, "Item not found");
                }
            } else {
                sendResponse(exchange, 404, "Not Found");
            }
        }
        
        private void handlePostItem(HttpExchange exchange) throws IOException {
            String requestBody = readRequestBody(exchange);
            
            try {
                @SuppressWarnings("unchecked")
                var itemRequest = (java.util.Map<String, Object>) objectMapper.readValue(requestBody, java.util.Map.class);
                
                String isbn = (String) itemRequest.get("isbn");
                String title = (String) itemRequest.get("title");
                String author = (String) itemRequest.get("author");
                Integer publicationYear = (Integer) itemRequest.get("publicationYear");
                String itemType = (String) itemRequest.get("itemType");
                
                // Validate required fields
                if (isbn == null || isbn.trim().isEmpty()) {
                    sendResponse(exchange, 400, "ISBN is required");
                    return;
                }
                if (title == null || title.trim().isEmpty()) {
                    sendResponse(exchange, 400, "Title is required");
                    return;
                }
                if (author == null || author.trim().isEmpty()) {
                    sendResponse(exchange, 400, "Author is required");
                    return;
                }
                if (publicationYear == null) {
                    sendResponse(exchange, 400, "Publication year is required");
                    return;
                }
                if (itemType == null || itemType.trim().isEmpty()) {
                    sendResponse(exchange, 400, "Item type is required (Book, Magazine, or Reference Book)");
                    return;
                }
                
                com.oaktown.library.model.LibraryItem newItem = null;
                
                // Create appropriate item based on type
                switch (itemType.toLowerCase()) {
                    case "book":
                        Integer pages = (Integer) itemRequest.get("pages");
                        String genre = (String) itemRequest.get("genre");
                        
                        if (pages == null) {
                            sendResponse(exchange, 400, "Pages is required for books");
                            return;
                        }
                        
                        newItem = new com.oaktown.library.model.Book(
                            isbn.trim(),
                            title.trim(),
                            author.trim(),
                            publicationYear,
                            pages,
                            genre != null ? genre.trim() : "General"
                        );
                        break;
                        
                    case "magazine":
                        Integer issueNumber = (Integer) itemRequest.get("issueNumber");
                        Integer volume = (Integer) itemRequest.getOrDefault("volume", 1);
                        String frequency = (String) itemRequest.getOrDefault("frequency", "Monthly");
                        
                        if (issueNumber == null) {
                            sendResponse(exchange, 400, "Issue number is required for magazines");
                            return;
                        }
                        
                        newItem = new com.oaktown.library.model.Magazine(
                            isbn.trim(),
                            title.trim(),
                            author.trim(),
                            publicationYear,
                            issueNumber,
                            volume,
                            frequency
                        );
                        break;
                        
                    case "reference book":
                    case "referencebook":
                        Integer refPages = (Integer) itemRequest.get("pages");
                        String refGenre = (String) itemRequest.get("genre");
                        Boolean restricted = (Boolean) itemRequest.getOrDefault("restricted", false);
                        
                        if (refPages == null) {
                            sendResponse(exchange, 400, "Pages is required for reference books");
                            return;
                        }
                        
                        newItem = new com.oaktown.library.model.ReferenceBook(
                            isbn.trim(),
                            title.trim(),
                            author.trim(),
                            publicationYear,
                            refPages,
                            refGenre != null ? refGenre.trim() : "Reference",
                            restricted
                        );
                        break;
                        
                    default:
                        sendResponse(exchange, 400, "Invalid item type. Must be Book, Magazine, or Reference Book");
                        return;
                }
                
                boolean success = library.addLibraryItem(newItem);
                
                if (success) {
                    String response = objectMapper.writeValueAsString(newItem);
                    sendJsonResponse(exchange, 201, response);
                } else {
                    sendResponse(exchange, 400, "Failed to add library item");
                }
                
            } catch (IllegalArgumentException e) {
                sendResponse(exchange, 400, e.getMessage());
            } catch (Exception e) {
                sendResponse(exchange, 400, "Invalid request: " + e.getMessage());
            }
        }
        
        private void handleDeleteItem(HttpExchange exchange, String path) throws IOException {
            if (path.startsWith("/api/items/")) {
                String isbn = path.substring("/api/items/".length());
                boolean success = library.removeLibraryItem(isbn);
                if (success) {
                    sendResponse(exchange, 200, "Item removed successfully");
                } else {
                    sendResponse(exchange, 400, "Failed to remove item");
                }
            } else {
                sendResponse(exchange, 404, "Not Found");
            }
        }
    }
    
    /**
     * Handler for members endpoints
     */
    private class MembersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();
            
            try {
                switch (method) {
                    case "GET":
                        handleGetMembers(exchange, path);
                        break;
                    case "POST":
                        handlePostMember(exchange);
                        break;
                    default:
                        sendResponse(exchange, 405, "Method Not Allowed");
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, "Internal Server Error: " + e.getMessage());
            }
        }
        
        private void handleGetMembers(HttpExchange exchange, String path) throws IOException {
            if (path.equals("/api/members")) {
                String response = objectMapper.writeValueAsString(library.getAllMembers());
                sendJsonResponse(exchange, 200, response);
            } else if (path.startsWith("/api/members/")) {
                String memberId = path.substring("/api/members/".length());
                var member = library.findMemberById(memberId);
                if (member != null) {
                    String response = objectMapper.writeValueAsString(member);
                    sendJsonResponse(exchange, 200, response);
                } else {
                    sendResponse(exchange, 404, "Member not found");
                }
            } else {
                sendResponse(exchange, 404, "Not Found");
            }
        }
        
        private void handlePostMember(HttpExchange exchange) throws IOException {
            String requestBody = readRequestBody(exchange);
            
            try {
                @SuppressWarnings("unchecked")
                var memberRequest = (java.util.Map<String, Object>) objectMapper.readValue(requestBody, java.util.Map.class);
                
                String memberId = (String) memberRequest.get("memberId");
                String name = (String) memberRequest.get("name");
                String email = (String) memberRequest.get("email");
                String phone = (String) memberRequest.get("phone");
                String address = (String) memberRequest.get("address");
                
                // Validate required fields
                if (memberId == null || memberId.trim().isEmpty()) {
                    sendResponse(exchange, 400, "Member ID is required");
                    return;
                }
                
                if (name == null || name.trim().isEmpty()) {
                    sendResponse(exchange, 400, "Name is required");
                    return;
                }
                
                // Create new member
                com.oaktown.library.model.Member newMember = new com.oaktown.library.model.Member(
                    memberId.trim(),
                    name.trim(),
                    email != null ? email.trim() : null,
                    phone != null ? phone.trim() : null,
                    address != null ? address.trim() : null
                );
                
                boolean success = library.addMember(newMember);
                
                if (success) {
                    String response = objectMapper.writeValueAsString(newMember);
                    sendJsonResponse(exchange, 201, response);
                } else {
                    sendResponse(exchange, 400, "Failed to add member");
                }
                
            } catch (IllegalArgumentException e) {
                sendResponse(exchange, 400, e.getMessage());
            } catch (Exception e) {
                sendResponse(exchange, 400, "Invalid request: " + e.getMessage());
            }
        }
    }
    
    /**
     * Handler for borrowing endpoints
     */
    private class BorrowingsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();
            
            try {
                switch (method) {
                    case "GET":
                        if (path.startsWith("/api/borrowings/member/")) {
                            handleGetBorrowingHistory(exchange);
                        } else {
                            sendResponse(exchange, 404, "Not Found");
                        }
                        break;
                    case "POST":
                        handleBorrowItem(exchange);
                        break;
                    case "PUT":
                        handleReturnItem(exchange);
                        break;
                    default:
                        sendResponse(exchange, 405, "Method Not Allowed");
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, "Internal Server Error: " + e.getMessage());
            }
        }
        
        private void handleBorrowItem(HttpExchange exchange) throws IOException {
            String requestBody = readRequestBody(exchange);
            
            try {
                @SuppressWarnings("unchecked")
                var borrowRequest = (java.util.Map<String, Object>) objectMapper.readValue(requestBody, java.util.Map.class);
                String isbn = (String) borrowRequest.get("isbn");
                String memberId = (String) borrowRequest.get("memberId");
                Integer days = (Integer) borrowRequest.getOrDefault("days", 14);
                
                var member = library.findMemberById(memberId);
                if (member == null) {
                    sendResponse(exchange, 404, "Member not found");
                    return;
                }
                
                boolean success = library.borrowItem(isbn, member, days);
                if (success) {
                    sendResponse(exchange, 200, "Item borrowed successfully");
                } else {
                    sendResponse(exchange, 400, "Failed to borrow item");
                }
                
            } catch (Exception e) {
                sendResponse(exchange, 400, "Invalid request: " + e.getMessage());
            }
        }
        
        private void handleReturnItem(HttpExchange exchange) throws IOException {
            String requestBody = readRequestBody(exchange);
            
            try {
                var returnRequest = objectMapper.readValue(requestBody, java.util.Map.class);
                String isbn = (String) returnRequest.get("isbn");
                String memberId = (String) returnRequest.get("memberId");
                
                var member = library.findMemberById(memberId);
                if (member == null) {
                    sendResponse(exchange, 404, "Member not found");
                    return;
                }
                
                boolean success = library.returnItem(isbn, member);
                if (success) {
                    sendResponse(exchange, 200, "Item returned successfully");
                } else {
                    sendResponse(exchange, 400, "Failed to return item");
                }
                
            } catch (Exception e) {
                sendResponse(exchange, 400, "Invalid request: " + e.getMessage());
            }
        }
        
        private void handleGetBorrowingHistory(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            String memberId = path.substring(path.lastIndexOf('/') + 1);
            
            try {
                var borrowingDAO = new com.oaktown.library.dao.BorrowingDAO();
                var borrowingHistory = borrowingDAO.getBorrowingHistory(memberId);
                
                String response = objectMapper.writeValueAsString(borrowingHistory);
                sendJsonResponse(exchange, 200, response);
                
            } catch (Exception e) {
                sendResponse(exchange, 500, "Error getting borrowing history: " + e.getMessage());
            }
        }
    }
    
    /**
     * Handler for statistics endpoint
     */
    private class StatsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            if ("GET".equals(exchange.getRequestMethod())) {
                try {
                    String response = objectMapper.writeValueAsString(library.getLibraryStatistics());
                    sendJsonResponse(exchange, 200, response);
                } catch (Exception e) {
                    sendResponse(exchange, 500, "Error getting statistics: " + e.getMessage());
                }
            } else {
                sendResponse(exchange, 405, "Method Not Allowed");
            }
        }
    }
    
    /**
     * Add CORS headers to response
     */
    private void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:3000");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().add("Access-Control-Allow-Credentials", "true");
    }
    
    /**
     * Send JSON response
     */
    private void sendJsonResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, responseBytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
        }
    }
    
    /**
     * Send text response
     */
    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().add("Content-Type", "text/plain");
        byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, responseBytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
        }
    }
    
    /**
     * Read request body as string
     */
    private String readRequestBody(HttpExchange exchange) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }

    /**
     * Extract session token from Authorization header
     */
    private String extractSessionToken(HttpExchange exchange) {
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * Validate authentication for protected endpoints
     */
    private SessionManager.SessionInfo validateAuthentication(HttpExchange exchange) {
        String token = extractSessionToken(exchange);
        return SessionManager.validateSession(token);
    }

    /**
     * Handler for authentication endpoints
     */
    private class AuthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();
            
            try {
                
                switch (method) {
                    case "POST":
                        if (path.equals("/api/auth/login")) {
                            handleLogin(exchange);
                        } else if (path.equals("/api/auth/logout")) {
                            handleLogout(exchange);
                        } else if (path.equals("/api/auth/admins")) {
                            handleCreateAdmin(exchange);
                        } else {
                            sendResponse(exchange, 404, "Not Found");
                        }
                        break;
                        
                    case "GET":
                        if (path.equals("/api/auth/profile")) {
                            handleGetProfile(exchange);
                        } else if (path.equals("/api/auth/admins")) {
                            handleGetAllAdmins(exchange);
                        } else {
                            sendResponse(exchange, 404, "Not Found");
                        }
                        break;
                        
                    case "PUT":
                        if (path.startsWith("/api/auth/admins/") && path.endsWith("/status")) {
                            handleUpdateAdminStatus(exchange, path);
                        } else {
                            sendResponse(exchange, 404, "Not Found");
                        }
                        break;
                        
                    default:
                        sendResponse(exchange, 405, "Method Not Allowed");
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, "Internal Server Error: " + e.getMessage());
            }
        }

        private void handleLogin(HttpExchange exchange) throws IOException {
            String body = readRequestBody(exchange);
            try {
                var loginRequest = objectMapper.readValue(body, java.util.Map.class);
                String email = (String) loginRequest.get("email");
                String password = (String) loginRequest.get("password");
                
                if (email == null || password == null) {
                    sendResponse(exchange, 400, "Email and password are required");
                    return;
                }
                
                var adminInfo = authService.authenticate(email, password);
                if (adminInfo != null) {
                    // Create session
                    String sessionToken = SessionManager.createSession(
                        adminInfo.getId(), 
                        adminInfo.getEmail(), 
                        adminInfo.getName()
                    );
                    
                    // Create response
                    var response = new java.util.HashMap<String, Object>();
                    response.put("token", sessionToken);
                    response.put("admin", adminInfo);
                    response.put("message", "Login successful");
                    
                    String responseJson = objectMapper.writeValueAsString(response);
                    sendJsonResponse(exchange, 200, responseJson);
                } else {
                    sendResponse(exchange, 401, "Invalid credentials");
                }
            } catch (Exception e) {
                sendResponse(exchange, 400, "Invalid request format");
            }
        }

        private void handleLogout(HttpExchange exchange) throws IOException {
            String token = extractSessionToken(exchange);
            if (token != null) {
                SessionManager.removeSession(token);
            }
            sendResponse(exchange, 200, "Logout successful");
        }

        private void handleGetProfile(HttpExchange exchange) throws IOException {
            SessionManager.SessionInfo sessionInfo = validateAuthentication(exchange);
            if (sessionInfo == null) {
                sendResponse(exchange, 401, "Authentication required");
                return;
            }
            
            var adminInfo = authService.findAdminById(sessionInfo.getAdminId());
            if (adminInfo != null) {
                String responseJson = objectMapper.writeValueAsString(adminInfo);
                sendJsonResponse(exchange, 200, responseJson);
            } else {
                sendResponse(exchange, 404, "Admin not found");
            }
        }

        private void handleGetAllAdmins(HttpExchange exchange) throws IOException {
            // Allow public access to admins list (for member chat)
            // Only return basic info, no sensitive data
            var admins = authService.getAllAdmins();
            String responseJson = objectMapper.writeValueAsString(admins);
            sendJsonResponse(exchange, 200, responseJson);
        }

        private void handleCreateAdmin(HttpExchange exchange) throws IOException {
            SessionManager.SessionInfo sessionInfo = validateAuthentication(exchange);
            if (sessionInfo == null) {
                sendResponse(exchange, 401, "Authentication required");
                return;
            }
            
            String body = readRequestBody(exchange);
            try {
                var createRequest = objectMapper.readValue(body, java.util.Map.class);
                String email = (String) createRequest.get("email");
                String password = (String) createRequest.get("password");
                String name = (String) createRequest.get("name");
                
                if (email == null || password == null || name == null) {
                    sendResponse(exchange, 400, "Email, password, and name are required");
                    return;
                }
                
                boolean success = authService.createAdmin(email, password, name, sessionInfo.getAdminId());
                if (success) {
                    sendResponse(exchange, 201, "Admin created successfully");
                } else {
                    sendResponse(exchange, 400, "Failed to create admin. Email may already exist or password doesn't meet requirements.");
                }
            } catch (Exception e) {
                sendResponse(exchange, 400, "Invalid request format");
            }
        }

        private void handleUpdateAdminStatus(HttpExchange exchange, String path) throws IOException {
            SessionManager.SessionInfo sessionInfo = validateAuthentication(exchange);
            if (sessionInfo == null) {
                sendResponse(exchange, 401, "Authentication required");
                return;
            }
            
            // Extract admin ID from path
            String[] pathParts = path.split("/");
            if (pathParts.length < 5) {
                sendResponse(exchange, 400, "Invalid path");
                return;
            }
            
            try {
                int adminId = Integer.parseInt(pathParts[4]);
                
                String body = readRequestBody(exchange);
                var updateRequest = objectMapper.readValue(body, java.util.Map.class);
                Boolean active = (Boolean) updateRequest.get("active");
                
                if (active == null) {
                    sendResponse(exchange, 400, "Active status is required");
                    return;
                }
                
                // Prevent self-deactivation
                if (adminId == sessionInfo.getAdminId() && !active) {
                    sendResponse(exchange, 400, "Cannot deactivate your own account");
                    return;
                }
                
                boolean success = authService.updateAdminStatus(adminId, active);
                if (success) {
                    sendResponse(exchange, 200, "Admin status updated successfully");
                } else {
                    sendResponse(exchange, 400, "Failed to update admin status");
                }
            } catch (NumberFormatException e) {
                sendResponse(exchange, 400, "Invalid admin ID");
            } catch (Exception e) {
                sendResponse(exchange, 400, "Invalid request format");
            }
        }
    }

    /**
     * Handler for chat endpoints
     */
    private class ChatHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();
            String query = exchange.getRequestURI().getQuery();
            
            try {
                if ("GET".equals(method) && path.equals("/api/chat/history")) {
                    handleGetChatHistory(exchange, query);
                } else if ("POST".equals(method) && path.equals("/api/chat/read")) {
                    handleMarkAsRead(exchange);
                } else {
                    sendResponse(exchange, 404, "Not Found");
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, "Internal Server Error: " + e.getMessage());
            }
        }

        private void handleGetChatHistory(HttpExchange exchange, String query) throws IOException {
            if (query == null) {
                sendResponse(exchange, 400, "Query parameters required");
                return;
            }

            Map<String, String> params = parseQueryString(query);
            String userId1 = params.get("userId1");
            String userType1 = params.get("userType1");
            String userId2 = params.get("userId2");
            String userType2 = params.get("userType2");

            if (userId1 == null || userType1 == null || userId2 == null || userType2 == null) {
                sendResponse(exchange, 400, "Missing required parameters");
                return;
            }

            List<ChatMessage> messages = chatMessageDAO.getConversation(userId1, userType1, userId2, userType2);
            String response = objectMapper.writeValueAsString(messages);
            sendJsonResponse(exchange, 200, response);
        }

        private void handleMarkAsRead(HttpExchange exchange) throws IOException {
            String body = readRequestBody(exchange);
            try {
                @SuppressWarnings("unchecked")
                var request = (java.util.Map<String, Object>) objectMapper.readValue(body, java.util.Map.class);
                String receiverId = (String) request.get("receiverId");
                String receiverType = (String) request.get("receiverType");
                String senderId = (String) request.get("senderId");
                String senderType = (String) request.get("senderType");

                if (receiverId == null || receiverType == null || senderId == null || senderType == null) {
                    sendResponse(exchange, 400, "Missing required parameters");
                    return;
                }

                boolean success = chatMessageDAO.markMessagesAsRead(receiverId, receiverType, senderId, senderType);
                if (success) {
                    sendResponse(exchange, 200, "Messages marked as read");
                } else {
                    sendResponse(exchange, 400, "Failed to mark messages as read");
                }
            } catch (Exception e) {
                sendResponse(exchange, 400, "Invalid request format");
            }
        }

        private Map<String, String> parseQueryString(String query) {
            Map<String, String> params = new HashMap<>();
            if (query != null && !query.isEmpty()) {
                String[] pairs = query.split("&");
                for (String pair : pairs) {
                    String[] keyValue = pair.split("=");
                    if (keyValue.length == 2) {
                        params.put(keyValue[0], keyValue[1]);
                    }
                }
            }
            return params;
        }
    }
    
    /**
     * Handler for file operations endpoints
     */
    private class FileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();
            
            try {
                switch (method) {
                    case "POST":
                        if (path.equals("/api/files/upload")) {
                            handleFileUpload(exchange);
                        } else {
                            sendResponse(exchange, 404, "Not Found");
                        }
                        break;
                    case "GET":
                        if (path.startsWith("/api/files/download/")) {
                            handleFileDownload(exchange, path);
                        } else if (path.equals("/api/files/list")) {
                            handleFileList(exchange);
                        } else if (path.startsWith("/api/files/")) {
                            String fileId = path.substring("/api/files/".length());
                            handleFileInfo(exchange, fileId);
                        } else {
                            sendResponse(exchange, 404, "Not Found");
                        }
                        break;
                    case "DELETE":
                        if (path.startsWith("/api/files/")) {
                            String fileId = path.substring("/api/files/".length());
                            handleFileDelete(exchange, fileId);
                        } else {
                            sendResponse(exchange, 404, "Not Found");
                        }
                        break;
                    default:
                        sendResponse(exchange, 405, "Method Not Allowed");
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, "Internal Server Error: " + e.getMessage());
            }
        }
        
        private void handleFileUpload(HttpExchange exchange) throws IOException {
            try {
                // For simplicity, this implementation accepts JSON with base64 encoded file data
                String requestBody = readRequestBody(exchange);
                @SuppressWarnings("unchecked")
                var request = (java.util.Map<String, Object>) objectMapper.readValue(requestBody, java.util.Map.class);
                
                String fileName = (String) request.get("fileName");
                String fileData = (String) request.get("fileData"); // base64 encoded
                String uploaderType = (String) request.get("uploaderType");
                String uploaderId = (String) request.get("uploaderId");
                String description = (String) request.get("description");
                
                if (fileName == null || fileData == null || uploaderType == null || uploaderId == null) {
                    sendResponse(exchange, 400, "Missing required parameters");
                    return;
                }
                
                // Decode base64 data
                byte[] fileBytes = java.util.Base64.getDecoder().decode(fileData);
                
                // Determine file type
                String fileType = getFileType(fileName);
                
                // Generate unique filename
                String uniqueFileName = System.currentTimeMillis() + "_" + fileName;
                String subDirectory = uploaderType.toLowerCase() + "/" + uploaderId;
                
                // Upload to FTP server
                FTPFileService.FileUploadResult uploadResult = 
                    ftpFileService.uploadFile(fileBytes, uniqueFileName, subDirectory);
                
                if (uploadResult.isSuccess()) {
                    // Save file metadata to database
                    ChatFile chatFile = new ChatFile(uniqueFileName, fileName, uploadResult.getRemotePath(),
                                                   fileType, uploadResult.getFileSize(), uploaderId, uploaderType);
                    chatFile.setDescription(description);
                    
                    int fileId = chatFileDAO.saveFile(chatFile);
                    
                    // Prepare response
                    var response = new java.util.HashMap<String, Object>();
                    response.put("success", true);
                    response.put("fileId", fileId);
                    response.put("fileName", fileName);
                    response.put("fileSize", uploadResult.getFileSize());
                    response.put("message", "File uploaded successfully");
                    
                    sendJsonResponse(exchange, 200, objectMapper.writeValueAsString(response));
                } else {
                    // Log the FTP/upload failure message for debugging
                    System.err.println("File upload failed (FTP): " + uploadResult.getMessage());

                    var response = new java.util.HashMap<String, Object>();
                    response.put("success", false);
                    response.put("message", uploadResult.getMessage());
                    
                    sendJsonResponse(exchange, 500, objectMapper.writeValueAsString(response));
                }
                
            } catch (Exception e) {
                // Print stack trace to help diagnose the cause of the 500
                e.printStackTrace();

                var response = new java.util.HashMap<String, Object>();
                response.put("success", false);
                response.put("message", "File upload failed: " + e.getMessage());
                
                sendJsonResponse(exchange, 500, objectMapper.writeValueAsString(response));
            }
        }
        
        private void handleFileDownload(HttpExchange exchange, String path) throws IOException {
            try {
                String fileId = path.substring("/api/files/download/".length());
                
                if (fileId.isEmpty()) {
                    sendResponse(exchange, 400, "File ID required");
                    return;
                }
                
                int id = Integer.parseInt(fileId);
                ChatFile chatFile = chatFileDAO.getFileById(id);
                
                if (chatFile == null) {
                    sendResponse(exchange, 404, "File not found");
                    return;
                }
                
                byte[] data = null;
                String filePath = chatFile.getFilePath();

                // Support local fallback paths saved as "local:<absolute-path>"
                if (filePath != null && filePath.startsWith("local:")) {
                    String localPath = filePath.substring("local:".length());
                    File localFile = new File(localPath);
                    if (!localFile.exists() || !localFile.isFile()) {
                        sendResponse(exchange, 404, "Local file not found");
                        return;
                    }
                    data = java.nio.file.Files.readAllBytes(localFile.toPath());
                } else {
                    // Download file from FTP server
                    FTPFileService.FileDownloadResult downloadResult = 
                        ftpFileService.downloadFileAsBytes(chatFile.getFilePath());

                    if (!downloadResult.isSuccess()) {
                        sendResponse(exchange, 500, "Failed to download file: " + downloadResult.getMessage());
                        return;
                    }

                    data = downloadResult.getFileData();
                }

                if (data == null) {
                    sendResponse(exchange, 500, "Failed to read file data");
                    return;
                }

                // Set appropriate headers for file download
                exchange.getResponseHeaders().set("Content-Disposition", 
                    "attachment; filename=\"" + chatFile.getOriginalFileName() + "\"");
                exchange.getResponseHeaders().set("Content-Type", "application/octet-stream");

                exchange.sendResponseHeaders(200, data.length);

                try (OutputStream outputStream = exchange.getResponseBody()) {
                    outputStream.write(data);
                }
                
            } catch (NumberFormatException e) {
                sendResponse(exchange, 400, "Invalid file ID");
            } catch (Exception e) {
                sendResponse(exchange, 500, "Download failed: " + e.getMessage());
            }
        }
        
        private void handleFileList(HttpExchange exchange) throws IOException {
            try {
                String query = exchange.getRequestURI().getQuery();
                Map<String, String> params = parseQueryString(query);
                
                String uploaderType = params.get("uploaderType");
                String uploaderId = params.get("uploaderId");
                
                List<ChatFile> files;
                
                if (uploaderType != null && uploaderId != null) {
                    files = chatFileDAO.getFilesByUploader(uploaderId, uploaderType);
                } else {
                    files = chatFileDAO.getAllFiles();
                }
                
                sendJsonResponse(exchange, 200, objectMapper.writeValueAsString(files));
                
            } catch (Exception e) {
                sendResponse(exchange, 500, "Failed to list files: " + e.getMessage());
            }
        }
        
        private void handleFileInfo(HttpExchange exchange, String fileId) throws IOException {
            try {
                if (fileId.isEmpty()) {
                    sendResponse(exchange, 400, "File ID required");
                    return;
                }
                
                int id = Integer.parseInt(fileId);
                ChatFile chatFile = chatFileDAO.getFileById(id);
                
                if (chatFile == null) {
                    sendResponse(exchange, 404, "File not found");
                    return;
                }
                
                sendJsonResponse(exchange, 200, objectMapper.writeValueAsString(chatFile));
                
            } catch (NumberFormatException e) {
                sendResponse(exchange, 400, "Invalid file ID");
            } catch (Exception e) {
                sendResponse(exchange, 500, "Failed to get file info: " + e.getMessage());
            }
        }
        
        private void handleFileDelete(HttpExchange exchange, String fileId) throws IOException {
            try {
                if (fileId.isEmpty()) {
                    sendResponse(exchange, 400, "File ID required");
                    return;
                }
                
                int id = Integer.parseInt(fileId);
                ChatFile chatFile = chatFileDAO.getFileById(id);
                
                if (chatFile == null) {
                    sendResponse(exchange, 404, "File not found");
                    return;
                }
                
                // Delete from FTP server
                boolean ftpDeleted = ftpFileService.deleteFile(chatFile.getFilePath());
                
                // Mark as inactive in database
                boolean dbDeleted = chatFileDAO.deleteFile(id);
                
                if (dbDeleted) {
                    var response = new java.util.HashMap<String, Object>();
                    response.put("success", true);
                    response.put("message", "File deleted successfully");
                    response.put("ftpDeleted", ftpDeleted);
                    
                    sendJsonResponse(exchange, 200, objectMapper.writeValueAsString(response));
                } else {
                    sendResponse(exchange, 500, "Failed to delete file from database");
                }
                
            } catch (NumberFormatException e) {
                sendResponse(exchange, 400, "Invalid file ID");
            } catch (Exception e) {
                sendResponse(exchange, 500, "Failed to delete file: " + e.getMessage());
            }
        }
        
        private String getFileType(String fileName) {
            int lastDot = fileName.lastIndexOf('.');
            if (lastDot > 0 && lastDot < fileName.length() - 1) {
                return fileName.substring(lastDot + 1).toLowerCase();
            }
            return "unknown";
        }

        private Map<String, String> parseQueryString(String query) {
            Map<String, String> params = new HashMap<>();
            if (query != null && !query.isEmpty()) {
                String[] pairs = query.split("&");
                for (String pair : pairs) {
                    String[] keyValue = pair.split("=");
                    if (keyValue.length == 2) {
                        params.put(keyValue[0], keyValue[1]);
                    }
                }
            }
            return params;
        }
    }
}
