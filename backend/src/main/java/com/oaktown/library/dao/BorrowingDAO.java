package com.oaktown.library.dao;

import com.oaktown.library.util.DatabaseConnection;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Data Access Object for borrowing transactions.
 * Handles all database operations related to borrowing and returning items.
 */
public class BorrowingDAO {
    
    private final DatabaseConnection dbConnection;
    
    public BorrowingDAO() {
        this.dbConnection = DatabaseConnection.getInstance();
    }
    
    /**
     * Borrow an item
     */
    public boolean borrowItem(String isbn, String memberId, int borrowDays, double dailyCost) {
        Connection conn = null;
        try {
            conn = dbConnection.getTransactionConnection();
            
            // Check if item is available
            if (!isItemAvailable(conn, isbn)) {
                return false;
            }
            
            // Check if member can borrow more items
            if (!canMemberBorrow(conn, memberId)) {
                return false;
            }
            
            LocalDate borrowDate = LocalDate.now();
            LocalDate dueDate = borrowDate.plusDays(borrowDays);
            
            // Insert borrowing record
            String borrowSql = "INSERT INTO borrowed_items (isbn, member_id, borrow_date, due_date, daily_cost, status) VALUES (?, ?, ?, ?, ?, 'BORROWED')";
            
            try (PreparedStatement stmt = conn.prepareStatement(borrowSql)) {
                stmt.setString(1, isbn);
                stmt.setString(2, memberId);
                stmt.setDate(3, Date.valueOf(borrowDate));
                stmt.setDate(4, Date.valueOf(dueDate));
                stmt.setDouble(5, dailyCost);
                
                int result = stmt.executeUpdate();
                
                if (result > 0) {
                    conn.commit();
                    return true;
                } else {
                    conn.rollback();
                    return false;
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error borrowing item: " + e.getMessage());
            DatabaseConnection.rollbackAndClose(conn);
            return false;
        } finally {
            DatabaseConnection.closeConnection(conn);
        }
    }
    
    /**
     * Return an item
     */
    public boolean returnItem(String isbn, String memberId) {
        Connection conn = null;
        try {
            conn = dbConnection.getTransactionConnection();
            
            // Find the borrowing record
            String findSql = "SELECT * FROM borrowed_items WHERE isbn = ? AND member_id = ? AND status = 'BORROWED'";
            
            int borrowingId = -1;
            LocalDate borrowDate = null;
            double dailyCost = 0.0;
            
            try (PreparedStatement findStmt = conn.prepareStatement(findSql)) {
                findStmt.setString(1, isbn);
                findStmt.setString(2, memberId);
                
                ResultSet rs = findStmt.executeQuery();
                if (rs.next()) {
                    borrowingId = rs.getInt("id");
                    borrowDate = rs.getDate("borrow_date").toLocalDate();
                    dailyCost = rs.getDouble("daily_cost");
                } else {
                    return false; // No active borrowing found
                }
            }
            
            // Calculate total cost
            LocalDate returnDate = LocalDate.now();
            long daysOut = java.time.temporal.ChronoUnit.DAYS.between(borrowDate, returnDate);
            if (daysOut < 1) daysOut = 1; // Minimum 1 day charge
            double totalCost = daysOut * dailyCost;
            
            // Update borrowing record
            String updateSql = "UPDATE borrowed_items SET return_date = ?, total_cost = ?, status = 'RETURNED' WHERE id = ?";
            
            try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                updateStmt.setDate(1, Date.valueOf(returnDate));
                updateStmt.setDouble(2, totalCost);
                updateStmt.setInt(3, borrowingId);
                
                int result = updateStmt.executeUpdate();
                
                if (result > 0) {
                    conn.commit();
                    return true;
                } else {
                    conn.rollback();
                    return false;
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error returning item: " + e.getMessage());
            DatabaseConnection.rollbackAndClose(conn);
            return false;
        } finally {
            DatabaseConnection.closeConnection(conn);
        }
    }
    
    /**
     * Get currently borrowed items for a member
     */
    public List<Map<String, Object>> getCurrentlyBorrowedItems(String memberId) {
        List<Map<String, Object>> items = new ArrayList<>();
        String sql = "SELECT bi.*, li.title, li.author FROM borrowed_items bi " +
                    "JOIN library_items li ON bi.isbn = li.isbn " +
                    "WHERE bi.member_id = ? AND bi.status = 'BORROWED' " +
                    "ORDER BY bi.borrow_date";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, memberId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("isbn", rs.getString("isbn"));
                item.put("title", rs.getString("title"));
                item.put("author", rs.getString("author"));
                item.put("borrowDate", rs.getDate("borrow_date").toLocalDate());
                item.put("dueDate", rs.getDate("due_date").toLocalDate());
                item.put("dailyCost", rs.getDouble("daily_cost"));
                items.add(item);
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting currently borrowed items: " + e.getMessage());
        }
        
        return items;
    }
    
    /**
     * Get borrowing history for a member
     */
    public List<Map<String, Object>> getBorrowingHistory(String memberId) {
        List<Map<String, Object>> items = new ArrayList<>();
        String sql = "SELECT bi.*, li.title, li.author FROM borrowed_items bi " +
                    "JOIN library_items li ON bi.isbn = li.isbn " +
                    "WHERE bi.member_id = ? AND bi.status = 'RETURNED' " +
                    "ORDER BY bi.return_date DESC";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, memberId);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("isbn", rs.getString("isbn"));
                item.put("title", rs.getString("title"));
                item.put("author", rs.getString("author"));
                item.put("borrowDate", rs.getDate("borrow_date").toLocalDate());
                item.put("returnDate", rs.getDate("return_date").toLocalDate());
                item.put("totalCost", rs.getDouble("total_cost"));
                items.add(item);
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting borrowing history: " + e.getMessage());
        }
        
        return items;
    }
    
    /**
     * Check if item is available
     */
    private boolean isItemAvailable(Connection conn, String isbn) throws SQLException {
        String sql = "SELECT available FROM library_items WHERE isbn = ?";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, isbn);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return rs.getBoolean("available");
            }
            return false;
        }
    }
    
    /**
     * Check if member can borrow more items
     */
    private boolean canMemberBorrow(Connection conn, String memberId) throws SQLException {
        String sql = "SELECT COUNT(*) as count FROM borrowed_items WHERE member_id = ? AND status = 'BORROWED'";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, memberId);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                int currentCount = rs.getInt("count");
                return currentCount < 5; // Max 5 items per member
            }
            return true;
        }
    }
    
    /**
     * Get overdue items
     */
    public List<Map<String, Object>> getOverdueItems() {
        List<Map<String, Object>> items = new ArrayList<>();
        String sql = "SELECT bi.*, li.title, li.author, m.name as member_name FROM borrowed_items bi " +
                    "JOIN library_items li ON bi.isbn = li.isbn " +
                    "JOIN members m ON bi.member_id = m.member_id " +
                    "WHERE bi.status = 'BORROWED' AND bi.due_date < CURRENT_DATE " +
                    "ORDER BY bi.due_date";
        
        try (Connection conn = dbConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("isbn", rs.getString("isbn"));
                item.put("title", rs.getString("title"));
                item.put("author", rs.getString("author"));
                item.put("memberId", rs.getString("member_id"));
                item.put("memberName", rs.getString("member_name"));
                item.put("borrowDate", rs.getDate("borrow_date").toLocalDate());
                item.put("dueDate", rs.getDate("due_date").toLocalDate());
                item.put("daysOverdue", 
                    java.time.temporal.ChronoUnit.DAYS.between(
                        rs.getDate("due_date").toLocalDate(), 
                        LocalDate.now()
                    )
                );
                items.add(item);
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting overdue items: " + e.getMessage());
        }
        
        return items;
    }
    
    /**
     * Calculate borrowing cost for a period
     */
    public double calculateBorrowingCost(String isbn, int days) {
        String sql = "SELECT item_type FROM library_items WHERE isbn = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, isbn);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                String itemType = rs.getString("item_type");
                double dailyCost;
                
                switch (itemType) {
                    case "BOOK":
                        dailyCost = 0.50;
                        break;
                    case "REFERENCE_BOOK":
                        dailyCost = 1.00;
                        break;
                    case "MAGAZINE":
                        dailyCost = 0.25;
                        break;
                    default:
                        dailyCost = 0.50;
                }
                
                return dailyCost * days;
            }
            
        } catch (SQLException e) {
            System.err.println("Error calculating borrowing cost: " + e.getMessage());
        }
        
        return 0.0;
    }
    
    /**
     * Get all borrowing history for all members
     */
    public List<Map<String, Object>> getAllBorrowingHistory() {
        List<Map<String, Object>> items = new ArrayList<>();
        String sql = "SELECT bi.*, li.title, li.author, li.item_type, m.name as member_name " +
                    "FROM borrowed_items bi " +
                    "JOIN library_items li ON bi.isbn = li.isbn " +
                    "JOIN members m ON bi.member_id = m.member_id " +
                    "ORDER BY bi.borrow_date DESC";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("isbn", rs.getString("isbn"));
                item.put("title", rs.getString("title"));
                item.put("author", rs.getString("author"));
                item.put("itemType", rs.getString("item_type"));
                item.put("memberId", rs.getString("member_id"));
                item.put("memberName", rs.getString("member_name"));
                item.put("borrowDate", rs.getDate("borrow_date").toLocalDate());
                item.put("dueDate", rs.getDate("due_date").toLocalDate());
                
                Date returnDate = rs.getDate("return_date");
                if (returnDate != null) {
                    item.put("returnDate", returnDate.toLocalDate());
                }
                
                item.put("status", rs.getString("status"));
                item.put("dailyCost", rs.getDouble("daily_cost"));
                
                Double totalCost = rs.getDouble("total_cost");
                if (totalCost != null && totalCost > 0) {
                    item.put("totalCost", totalCost);
                }
                
                items.add(item);
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting all borrowing history: " + e.getMessage());
        }
        
        return items;
    }
}