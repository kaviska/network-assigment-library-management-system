package com.oaktown.library.model;

import java.time.LocalDateTime;

/**
 * Represents an admin user in the library management system
 */
public class Admin {
    private int id;
    private String email;
    private String password;
    private String name;
    private LocalDateTime createdDate;
    private LocalDateTime lastLogin;
    private boolean active;
    private Integer createdBy;

    // Default constructor
    public Admin() {}

    // Constructor for creating new admin
    public Admin(String email, String password, String name) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.active = true;
    }

    // Constructor with all fields
    public Admin(int id, String email, String password, String name, 
                LocalDateTime createdDate, LocalDateTime lastLogin, boolean active, Integer createdBy) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        this.createdDate = createdDate;
        this.lastLogin = lastLogin;
        this.active = active;
        this.createdBy = createdBy;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Integer getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }

    @Override
    public String toString() {
        return String.format("Admin{id=%d, email='%s', name='%s', active=%s, createdDate=%s}",
                id, email, name, active, createdDate);
    }

    // Method to get admin info without password for API responses
    public AdminInfo toAdminInfo() {
        return new AdminInfo(id, email, name, createdDate, lastLogin, active);
    }

    /**
     * Inner class for admin information without password (for API responses)
     */
    public static class AdminInfo {
        private int id;
        private String email;
        private String name;
        private LocalDateTime createdDate;
        private LocalDateTime lastLogin;
        private boolean active;

        public AdminInfo(int id, String email, String name, LocalDateTime createdDate, 
                        LocalDateTime lastLogin, boolean active) {
            this.id = id;
            this.email = email;
            this.name = name;
            this.createdDate = createdDate;
            this.lastLogin = lastLogin;
            this.active = active;
        }

        // Getters
        public int getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public LocalDateTime getCreatedDate() { return createdDate; }
        public LocalDateTime getLastLogin() { return lastLogin; }
        public boolean isActive() { return active; }
    }
}