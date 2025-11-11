package com.oaktown.library.dao;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.mindrot.jbcrypt.BCrypt;

import com.oaktown.library.model.Admin;
import com.oaktown.library.util.DatabaseConnection;

/**
 * Data Access Object for Admin entities
 */
public class AdminDAO {
    
    private final DatabaseConnection dbConnection;
    
    public AdminDAO() {
        this.dbConnection = DatabaseConnection.getInstance();
    }

    /**
     * Authenticate admin with email and password
     */
    public Admin authenticate(String email, String password) {
        String sql = "SELECT * FROM admins WHERE email = ? AND active = TRUE";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                String storedPasswordHash = rs.getString("password");
                
                // Verify password using BCrypt
                if (BCrypt.checkpw(password, storedPasswordHash)) {
                    Admin admin = mapResultSetToAdmin(rs);
                    
                    // Update last login
                    updateLastLogin(admin.getId());
                    admin.setLastLogin(LocalDateTime.now());
                    
                    return admin;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error authenticating admin: " + e.getMessage());
        }
        
        return null;
    }

    /**
     * Find admin by email
     */
    public Admin findByEmail(String email) {
        String sql = "SELECT * FROM admins WHERE email = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return mapResultSetToAdmin(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error finding admin by email: " + e.getMessage());
        }
        
        return null;
    }

    /**
     * Find admin by ID
     */
    public Admin findById(int id) {
        String sql = "SELECT * FROM admins WHERE id = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return mapResultSetToAdmin(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error finding admin by ID: " + e.getMessage());
        }
        
        return null;
    }

    /**
     * Create a new admin
     */
    public boolean createAdmin(Admin admin, int createdById) {
        // Check if email already exists
        if (findByEmail(admin.getEmail()) != null) {
            return false;
        }

        String sql = "INSERT INTO admins (email, password, name, created_by) VALUES (?, ?, ?, ?)";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            // Hash the password
            String hashedPassword = BCrypt.hashpw(admin.getPassword(), BCrypt.gensalt());
            
            stmt.setString(1, admin.getEmail());
            stmt.setString(2, hashedPassword);
            stmt.setString(3, admin.getName());
            stmt.setInt(4, createdById);
            
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                // Get the generated ID
                ResultSet generatedKeys = stmt.getGeneratedKeys();
                if (generatedKeys.next()) {
                    admin.setId(generatedKeys.getInt(1));
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error creating admin: " + e.getMessage());
        }
        
        return false;
    }

    /**
     * Get all admins
     */
    public List<Admin.AdminInfo> getAllAdmins() {
        List<Admin.AdminInfo> admins = new ArrayList<>();
        String sql = "SELECT * FROM admins ORDER BY created_date DESC";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                Admin admin = mapResultSetToAdmin(rs);
                admins.add(admin.toAdminInfo());
            }
        } catch (SQLException e) {
            System.err.println("Error getting all admins: " + e.getMessage());
        }
        
        return admins;
    }

    /**
     * Update admin status (active/inactive)
     */
    public boolean updateAdminStatus(int adminId, boolean active) {
        String sql = "UPDATE admins SET active = ? WHERE id = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setBoolean(1, active);
            stmt.setInt(2, adminId);
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating admin status: " + e.getMessage());
        }
        
        return false;
    }

    /**
     * Update admin password
     */
    public boolean updatePassword(int adminId, String newPassword) {
        String sql = "UPDATE admins SET password = ? WHERE id = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            String hashedPassword = BCrypt.hashpw(newPassword, BCrypt.gensalt());
            stmt.setString(1, hashedPassword);
            stmt.setInt(2, adminId);
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating admin password: " + e.getMessage());
        }
        
        return false;
    }

    /**
     * Initialize default admin if none exists
     */
    public void initializeDefaultAdmin() {
        // Check if any admin exists
        String countSql = "SELECT COUNT(*) FROM admins";
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(countSql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next() && rs.getInt(1) == 0) {
                // No admins exist, create default admin
                String insertSql = "INSERT INTO admins (email, password, name) VALUES (?, ?, ?)";
                try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                    String hashedPassword = BCrypt.hashpw("Admin@123", BCrypt.gensalt());
                    insertStmt.setString(1, "admin@gmail.com");
                    insertStmt.setString(2, hashedPassword);
                    insertStmt.setString(3, "System Administrator");
                    insertStmt.executeUpdate();
                    System.out.println("Default admin created: admin@gmail.com / Admin@123");
                }
            }
        } catch (SQLException e) {
            System.err.println("Error initializing default admin: " + e.getMessage());
        }
    }

    /**
     * Update last login timestamp
     */
    private void updateLastLogin(int adminId) {
        String sql = "UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, adminId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Error updating last login: " + e.getMessage());
        }
    }

    /**
     * Map ResultSet to Admin object
     */
    private Admin mapResultSetToAdmin(ResultSet rs) throws SQLException {
        Admin admin = new Admin();
        admin.setId(rs.getInt("id"));
        admin.setEmail(rs.getString("email"));
        admin.setPassword(rs.getString("password"));
        admin.setName(rs.getString("name"));
        
        Timestamp createdDate = rs.getTimestamp("created_date");
        if (createdDate != null) {
            admin.setCreatedDate(createdDate.toLocalDateTime());
        }
        
        Timestamp lastLogin = rs.getTimestamp("last_login");
        if (lastLogin != null) {
            admin.setLastLogin(lastLogin.toLocalDateTime());
        }
        
        admin.setActive(rs.getBoolean("active"));
        
        int createdBy = rs.getInt("created_by");
        if (!rs.wasNull()) {
            admin.setCreatedBy(createdBy);
        }
        
        return admin;
    }
}