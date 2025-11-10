package com.oaktown.library;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.oaktown.library.service.Library;
import com.oaktown.library.util.DatabaseConnection;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

/**
 * Pure Java HTTP REST API server for the OakTown Library Management System.
 * Uses Java's built-in com.sun.net.httpserver.HttpServer.
 */
public class RestApiServer {
    
    private final Library library;
    private final ObjectMapper objectMapper;
    private HttpServer server;
    
    public RestApiServer() {
        this.library = new Library();
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
        server.createContext("/api/items", new ItemsHandler());
        server.createContext("/api/members", new MembersHandler());
        server.createContext("/api/borrowings", new BorrowingsHandler());
        server.createContext("/api/stats", new StatsHandler());
        
        // Set executor to null (uses default)
        server.setExecutor(null);
        
        // Start the server
        server.start();
        
        System.out.println("Server started on http://localhost:8080");
        System.out.println("API endpoints available:");
        System.out.println("  GET    /api/items           - Get all library items");
        System.out.println("  GET    /api/items/search    - Search items by keyword");
        System.out.println("  GET    /api/items/{isbn}    - Get item by ISBN");
        System.out.println("  POST   /api/items           - Add new item");
        System.out.println("  DELETE /api/items/{isbn}    - Remove item");
        System.out.println("  GET    /api/members         - Get all members");
        System.out.println("  GET    /api/members/{id}    - Get member by ID");
        System.out.println("  POST   /api/members         - Add new member");
        System.out.println("  PUT    /api/members/{id}    - Update member");
        System.out.println("  POST   /api/borrowings      - Borrow item");
        System.out.println("  PUT    /api/borrowings      - Return item");
        System.out.println("  GET    /api/stats           - Get library statistics");
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
            // For now, return not implemented
            sendResponse(exchange, 501, "Not Implemented - Use console application to add items");
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
            sendResponse(exchange, 501, "Not Implemented - Use console application to add members");
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
            
            try {
                switch (method) {
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
                var borrowRequest = objectMapper.readValue(requestBody, java.util.Map.class);
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
}