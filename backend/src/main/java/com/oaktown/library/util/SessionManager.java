package com.oaktown.library.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple session management utility
 */
public class SessionManager {
    
    private static final int SESSION_DURATION_HOURS = 24;
    private static final ConcurrentHashMap<String, SessionData> sessions = new ConcurrentHashMap<>();
    
    private static class SessionData {
        private final int adminId;
        private final String email;
        private final String name;
        private final LocalDateTime createdAt;
        private LocalDateTime lastAccessed;
        
        public SessionData(int adminId, String email, String name) {
            this.adminId = adminId;
            this.email = email;
            this.name = name;
            this.createdAt = LocalDateTime.now();
            this.lastAccessed = LocalDateTime.now();
        }
        
        public boolean isValid() {
            return lastAccessed.isAfter(LocalDateTime.now().minusHours(SESSION_DURATION_HOURS));
        }
        
        public void updateLastAccessed() {
            this.lastAccessed = LocalDateTime.now();
        }
        
        // Getters
        public int getAdminId() { return adminId; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getLastAccessed() { return lastAccessed; }
    }
    
    /**
     * Create a new session for the admin
     */
    public static String createSession(int adminId, String email, String name) {
        String sessionToken = generateSessionToken(adminId, email);
        SessionData sessionData = new SessionData(adminId, email, name);
        sessions.put(sessionToken, sessionData);
        
        // Clean up expired sessions periodically
        cleanupExpiredSessions();
        
        return sessionToken;
    }
    
    /**
     * Validate session token and return admin info
     */
    public static SessionInfo validateSession(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }
        
        SessionData sessionData = sessions.get(token);
        if (sessionData == null || !sessionData.isValid()) {
            if (sessionData != null) {
                sessions.remove(token); // Remove expired session
            }
            return null;
        }
        
        sessionData.updateLastAccessed();
        return new SessionInfo(sessionData.getAdminId(), sessionData.getEmail(), sessionData.getName());
    }
    
    /**
     * Remove session (logout)
     */
    public static void removeSession(String token) {
        if (token != null) {
            sessions.remove(token);
        }
    }
    
    /**
     * Clean up expired sessions
     */
    private static void cleanupExpiredSessions() {
        sessions.entrySet().removeIf(entry -> !entry.getValue().isValid());
    }
    
    /**
     * Generate session token
     */
    private static String generateSessionToken(int adminId, String email) {
        try {
            String data = adminId + ":" + email + ":" + System.currentTimeMillis();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            // Fallback to simple encoding
            String data = adminId + ":" + email + ":" + System.currentTimeMillis();
            return Base64.getEncoder().encodeToString(data.getBytes());
        }
    }
    
    /**
     * Session information class
     */
    public static class SessionInfo {
        private final int adminId;
        private final String email;
        private final String name;
        
        public SessionInfo(int adminId, String email, String name) {
            this.adminId = adminId;
            this.email = email;
            this.name = name;
        }
        
        public int getAdminId() { return adminId; }
        public String getEmail() { return email; }
        public String getName() { return name; }
    }
}