package com.oaktown.library.service;

import java.util.List;

import com.oaktown.library.dao.AdminDAO;
import com.oaktown.library.model.Admin;

/**
 * Service class for authentication and admin management
 */
public class AuthService {
    
    private final AdminDAO adminDAO;
    
    public AuthService() {
        this.adminDAO = new AdminDAO();
        // Initialize default admin if none exists
        this.adminDAO.initializeDefaultAdmin();
    }

    /**
     * Authenticate admin with email and password
     */
    public Admin.AdminInfo authenticate(String email, String password) {
        if (email == null || email.trim().isEmpty() || 
            password == null || password.trim().isEmpty()) {
            return null;
        }
        
        Admin admin = adminDAO.authenticate(email.trim(), password);
        return admin != null ? admin.toAdminInfo() : null;
    }

    /**
     * Create a new admin (only existing admin can create new admin)
     */
    public boolean createAdmin(String email, String password, String name, int createdById) {
        if (email == null || email.trim().isEmpty() ||
            password == null || password.trim().isEmpty() ||
            name == null || name.trim().isEmpty()) {
            return false;
        }

        // Validate email format
        if (!isValidEmail(email.trim())) {
            return false;
        }

        // Validate password strength
        if (!isValidPassword(password)) {
            return false;
        }

        Admin newAdmin = new Admin(email.trim(), password, name.trim());
        return adminDAO.createAdmin(newAdmin, createdById);
    }

    /**
     * Get all admins (for admin management)
     */
    public List<Admin.AdminInfo> getAllAdmins() {
        return adminDAO.getAllAdmins();
    }

    /**
     * Update admin status
     */
    public boolean updateAdminStatus(int adminId, boolean active) {
        return adminDAO.updateAdminStatus(adminId, active);
    }

    /**
     * Update admin password
     */
    public boolean updatePassword(int adminId, String newPassword) {
        if (newPassword == null || !isValidPassword(newPassword)) {
            return false;
        }
        return adminDAO.updatePassword(adminId, newPassword);
    }

    /**
     * Find admin by ID
     */
    public Admin.AdminInfo findAdminById(int id) {
        Admin admin = adminDAO.findById(id);
        return admin != null ? admin.toAdminInfo() : null;
    }

    /**
     * Validate email format
     */
    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    /**
     * Validate password strength
     * Minimum 6 characters, at least one uppercase letter, one lowercase letter, and one digit
     */
    private boolean isValidPassword(String password) {
        if (password.length() < 6) {
            return false;
        }
        
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if (!Character.isLetterOrDigit(c)) hasSpecial = true;
        }
        
        return hasUpper && hasLower && (hasDigit || hasSpecial);
    }
}