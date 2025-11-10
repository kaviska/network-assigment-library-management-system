package com.oaktown.library.dao;

import com.oaktown.library.model.*;
import com.oaktown.library.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for LibraryItem entities.
 * Handles all database operations related to library items.
 */
public class LibraryItemDAO {
    
    private final DatabaseConnection dbConnection;
    
    public LibraryItemDAO() {
        this.dbConnection = DatabaseConnection.getInstance();
    }
    
    /**
     * Create a new library item in the database
     */
    public boolean createLibraryItem(LibraryItem item) {
        Connection conn = null;
        try {
            conn = dbConnection.getTransactionConnection();
            
            // Insert into library_items table
            String itemSql = "INSERT INTO library_items (isbn, title, author, publication_year, item_type, current_borrower, available) VALUES (?, ?, ?, ?, ?, ?, ?)";
            
            try (PreparedStatement stmt = conn.prepareStatement(itemSql)) {
                stmt.setString(1, item.getIsbn());
                stmt.setString(2, item.getTitle());
                stmt.setString(3, item.getAuthor());
                stmt.setInt(4, item.getPublicationYear());
                stmt.setString(5, item.getItemType().toUpperCase().replace(" ", "_"));
                stmt.setString(6, item.getCurrentBorrower());
                stmt.setBoolean(7, item.isAvailable());
                
                stmt.executeUpdate();
            }
            
            // Insert into specific type table
            boolean success = false;
            if (item instanceof ReferenceBook) {
                success = insertReferenceBook(conn, (ReferenceBook) item);
            } else if (item instanceof Book) {
                success = insertBook(conn, (Book) item);
            } else if (item instanceof Magazine) {
                success = insertMagazine(conn, (Magazine) item);
            }
            
            if (success) {
                conn.commit();
                return true;
            } else {
                conn.rollback();
                return false;
            }
            
        } catch (SQLException e) {
            System.err.println("Error creating library item: " + e.getMessage());
            DatabaseConnection.rollbackAndClose(conn);
            return false;
        } finally {
            DatabaseConnection.closeConnection(conn);
        }
    }
    
    /**
     * Find library item by ISBN
     */
    public LibraryItem findByIsbn(String isbn) {
        String sql = "SELECT li.*, b.pages, b.genre, rb.restricted, m.issue_number, m.volume, m.frequency " +
                    "FROM library_items li " +
                    "LEFT JOIN books b ON li.isbn = b.isbn " +
                    "LEFT JOIN reference_books rb ON li.isbn = rb.isbn " +
                    "LEFT JOIN magazines m ON li.isbn = m.isbn " +
                    "WHERE li.isbn = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, isbn);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return mapResultSetToLibraryItem(rs);
            }
            
        } catch (SQLException e) {
            System.err.println("Error finding library item: " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Get all library items
     */
    public List<LibraryItem> findAll() {
        List<LibraryItem> items = new ArrayList<>();
        String sql = "SELECT li.*, b.pages, b.genre, rb.restricted, m.issue_number, m.volume, m.frequency " +
                    "FROM library_items li " +
                    "LEFT JOIN books b ON li.isbn = b.isbn " +
                    "LEFT JOIN reference_books rb ON li.isbn = rb.isbn " +
                    "LEFT JOIN magazines m ON li.isbn = m.isbn " +
                    "ORDER BY li.title";
        
        try (Connection conn = dbConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                LibraryItem item = mapResultSetToLibraryItem(rs);
                if (item != null) {
                    items.add(item);
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting all library items: " + e.getMessage());
        }
        
        return items;
    }
    
    /**
     * Find available items by title keyword
     */
    public List<LibraryItem> findAvailableByTitleKeyword(String keyword) {
        List<LibraryItem> items = new ArrayList<>();
        String sql = "SELECT li.*, b.pages, b.genre, rb.restricted, m.issue_number, m.volume, m.frequency " +
                    "FROM library_items li " +
                    "LEFT JOIN books b ON li.isbn = b.isbn " +
                    "LEFT JOIN reference_books rb ON li.isbn = rb.isbn " +
                    "LEFT JOIN magazines m ON li.isbn = m.isbn " +
                    "WHERE li.available = TRUE AND li.title LIKE ? " +
                    "ORDER BY li.title";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, "%" + keyword + "%");
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                LibraryItem item = mapResultSetToLibraryItem(rs);
                if (item != null && item.canBeBorrowed()) {
                    items.add(item);
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error finding available items by keyword: " + e.getMessage());
        }
        
        return items;
    }
    
    /**
     * Update library item availability
     */
    public boolean updateAvailability(String isbn, boolean available, String borrowerId) {
        String sql = "UPDATE library_items SET available = ?, current_borrower = ? WHERE isbn = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setBoolean(1, available);
            stmt.setString(2, borrowerId);
            stmt.setString(3, isbn);
            
            return stmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            System.err.println("Error updating item availability: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Delete library item
     */
    public boolean deleteLibraryItem(String isbn) {
        String sql = "DELETE FROM library_items WHERE isbn = ?";
        
        try (Connection conn = dbConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, isbn);
            return stmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            System.err.println("Error deleting library item: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Insert book record
     */
    private boolean insertBook(Connection conn, Book book) throws SQLException {
        String sql = "INSERT INTO books (isbn, pages, genre) VALUES (?, ?, ?)";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, book.getIsbn());
            stmt.setInt(2, book.getPages());
            stmt.setString(3, book.getGenre());
            
            return stmt.executeUpdate() > 0;
        }
    }
    
    /**
     * Insert reference book record
     */
    private boolean insertReferenceBook(Connection conn, ReferenceBook refBook) throws SQLException {
        // First insert into books table
        if (!insertBook(conn, refBook)) {
            return false;
        }
        
        // Then insert into reference_books table
        String sql = "INSERT INTO reference_books (isbn, restricted) VALUES (?, ?)";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, refBook.getIsbn());
            stmt.setBoolean(2, refBook.isRestricted());
            
            return stmt.executeUpdate() > 0;
        }
    }
    
    /**
     * Insert magazine record
     */
    private boolean insertMagazine(Connection conn, Magazine magazine) throws SQLException {
        String sql = "INSERT INTO magazines (isbn, issue_number, volume, frequency) VALUES (?, ?, ?, ?)";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, magazine.getIsbn());
            stmt.setInt(2, magazine.getIssueNumber());
            stmt.setInt(3, magazine.getVolume());
            stmt.setString(4, magazine.getFrequency());
            
            return stmt.executeUpdate() > 0;
        }
    }
    
    /**
     * Map ResultSet to LibraryItem object
     */
    private LibraryItem mapResultSetToLibraryItem(ResultSet rs) throws SQLException {
        String isbn = rs.getString("isbn");
        String title = rs.getString("title");
        String author = rs.getString("author");
        int publicationYear = rs.getInt("publication_year");
        String itemType = rs.getString("item_type");
        String currentBorrower = rs.getString("current_borrower");
        boolean available = rs.getBoolean("available");
        
        LibraryItem item = null;
        
        switch (itemType) {
            case "REFERENCE_BOOK":
                int pages = rs.getInt("pages");
                String genre = rs.getString("genre");
                boolean restricted = rs.getBoolean("restricted");
                item = new ReferenceBook(isbn, title, author, publicationYear, pages, genre, restricted);
                break;
                
            case "BOOK":
                pages = rs.getInt("pages");
                genre = rs.getString("genre");
                item = new Book(isbn, title, author, publicationYear, pages, genre);
                break;
                
            case "MAGAZINE":
                int issueNumber = rs.getInt("issue_number");
                int volume = rs.getInt("volume");
                String frequency = rs.getString("frequency");
                item = new Magazine(isbn, title, author, publicationYear, issueNumber, volume, frequency);
                break;
        }
        
        if (item != null) {
            // Set borrowing status
            if (!available && currentBorrower != null) {
                item.setBorrowerForDAO(currentBorrower);
            }
        }
        
        return item;
    }
}