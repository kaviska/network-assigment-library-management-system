package com.oaktown.library.dao;

import com.oaktown.library.model.Member;
import com.oaktown.library.util.DatabaseConnection;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Member entities.
 * Handles all database operations related to members.
 */
public class MemberDAO {
    
    private final DatabaseConnection dbConnection;
    
    public MemberDAO() {
        this.dbConnection = DatabaseConnection.getInstance();
    }
    
    /**
     * Create a new member in the database
     */
    public boolean createMember(Member member) {
        String sql = "INSERT INTO members (member_id, name, email, phone, address, registration_date, active) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, member.getMemberId());
            stmt.setString(2, member.getName());
            stmt.setString(3, member.getEmail());
            stmt.setString(4, member.getPhone());
            stmt.setString(5, member.getAddress());
            stmt.setDate(6, Date.valueOf(member.getRegistrationDate()));
            stmt.setBoolean(7, member.isActive());
            
            return stmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            System.err.println("Error creating member: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Find a member by ID
     */
    public Member findById(String memberId) {
        String sql = "SELECT * FROM members WHERE member_id = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, memberId);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return mapResultSetToMember(rs);
            }
            
        } catch (SQLException e) {
            System.err.println("Error finding member: " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Get all members
     */
    public List<Member> findAll() {
        List<Member> members = new ArrayList<>();
        String sql = "SELECT * FROM members ORDER BY name";
        
        try (Connection conn = dbConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                members.add(mapResultSetToMember(rs));
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting all members: " + e.getMessage());
        }
        
        return members;
    }
    
    /**
     * Update member information
     */
    public boolean updateMember(Member member) {
        String sql = "UPDATE members SET name = ?, email = ?, phone = ?, address = ?, active = ? WHERE member_id = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, member.getName());
            stmt.setString(2, member.getEmail());
            stmt.setString(3, member.getPhone());
            stmt.setString(4, member.getAddress());
            stmt.setBoolean(5, member.isActive());
            stmt.setString(6, member.getMemberId());
            
            return stmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            System.err.println("Error updating member: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Delete a member
     */
    public boolean deleteMember(String memberId) {
        String sql = "DELETE FROM members WHERE member_id = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, memberId);
            return stmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            System.err.println("Error deleting member: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Get currently borrowed items for a member
     */
    public List<String> getCurrentlyBorrowedItems(String memberId) {
        List<String> items = new ArrayList<>();
        String sql = "SELECT isbn FROM borrowed_items WHERE member_id = ? AND status = 'BORROWED'";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, memberId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                items.add(rs.getString("isbn"));
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting currently borrowed items: " + e.getMessage());
        }
        
        return items;
    }
    
    /**
     * Get previously borrowed items for a member
     */
    public List<String> getPreviouslyBorrowedItems(String memberId) {
        List<String> items = new ArrayList<>();
        String sql = "SELECT DISTINCT isbn FROM borrowed_items WHERE member_id = ? AND status = 'RETURNED'";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, memberId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                items.add(rs.getString("isbn"));
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting previously borrowed items: " + e.getMessage());
        }
        
        return items;
    }
    
    /**
     * Find members by name (partial match)
     */
    public List<Member> findByName(String namePattern) {
        List<Member> members = new ArrayList<>();
        String sql = "SELECT * FROM members WHERE name LIKE ? ORDER BY name";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, "%" + namePattern + "%");
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                members.add(mapResultSetToMember(rs));
            }
            
        } catch (SQLException e) {
            System.err.println("Error finding members by name: " + e.getMessage());
        }
        
        return members;
    }
    
    /**
     * Check if member exists
     */
    public boolean memberExists(String memberId) {
        String sql = "SELECT 1 FROM members WHERE member_id = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, memberId);
            ResultSet rs = stmt.executeQuery();
            
            return rs.next();
            
        } catch (SQLException e) {
            System.err.println("Error checking if member exists: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Map ResultSet to Member object
     */
    private Member mapResultSetToMember(ResultSet rs) throws SQLException {
        String memberId = rs.getString("member_id");
        String name = rs.getString("name");
        String email = rs.getString("email");
        String phone = rs.getString("phone");
        String address = rs.getString("address");
        LocalDate registrationDate = rs.getDate("registration_date").toLocalDate();
        boolean active = rs.getBoolean("active");
        
        Member member = new Member(memberId, name, email, phone, address, registrationDate, active);
        
        // Load borrowed items
        List<String> currentItems = getCurrentlyBorrowedItems(memberId);
        List<String> previousItems = getPreviouslyBorrowedItems(memberId);
        
        // Set the borrowed items (using reflection or a setter method if available)
        // For now, we'll populate them manually
        for (String isbn : currentItems) {
            try {
                member.borrowItem(isbn);
            } catch (Exception e) {
                // Item might already be added, ignore
            }
        }
        
        return member;
    }
}