package com.oaktown.library.dao;

import com.oaktown.library.model.ChatFile;
import com.oaktown.library.util.DatabaseConnection;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for ChatFile operations
 */
public class ChatFileDAO {
    
    /**
     * Save a new file record to the database
     */
    public int saveFile(ChatFile file) throws SQLException {
        String sql = "INSERT INTO chat_files (file_name, original_file_name, file_path, file_type, " +
                    "file_size, uploaded_by, uploader_type, upload_date, is_active, description) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, file.getFileName());
            stmt.setString(2, file.getOriginalFileName());
            stmt.setString(3, file.getFilePath());
            stmt.setString(4, file.getFileType());
            stmt.setLong(5, file.getFileSize());
            stmt.setString(6, file.getUploadedBy());
            stmt.setString(7, file.getUploaderType());
            stmt.setTimestamp(8, Timestamp.valueOf(file.getUploadDate()));
            stmt.setBoolean(9, file.isActive());
            stmt.setString(10, file.getDescription());
            
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        int fileId = generatedKeys.getInt(1);
                        file.setId(fileId);
                        return fileId;
                    }
                }
            }
            
            throw new SQLException("Failed to save file, no ID obtained");
        }
    }
    
    /**
     * Get a file by its ID
     */
    public ChatFile getFileById(int fileId) throws SQLException {
        String sql = "SELECT * FROM chat_files WHERE id = ? AND is_active = true";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, fileId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToFile(rs);
                }
            }
        }
        
        return null;
    }
    
    /**
     * Get files uploaded by a specific user
     */
    public List<ChatFile> getFilesByUploader(String uploaderId, String uploaderType) throws SQLException {
        String sql = "SELECT * FROM chat_files WHERE uploaded_by = ? AND uploader_type = ? " +
                    "AND is_active = true ORDER BY upload_date DESC";
        
        List<ChatFile> files = new ArrayList<>();
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, uploaderId);
            stmt.setString(2, uploaderType);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    files.add(mapResultSetToFile(rs));
                }
            }
        }
        
        return files;
    }
    
    /**
     * Get files in a date range
     */
    public List<ChatFile> getFilesByDateRange(LocalDateTime startDate, LocalDateTime endDate) throws SQLException {
        String sql = "SELECT * FROM chat_files WHERE upload_date BETWEEN ? AND ? " +
                    "AND is_active = true ORDER BY upload_date DESC";
        
        List<ChatFile> files = new ArrayList<>();
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setTimestamp(1, Timestamp.valueOf(startDate));
            stmt.setTimestamp(2, Timestamp.valueOf(endDate));
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    files.add(mapResultSetToFile(rs));
                }
            }
        }
        
        return files;
    }
    
    /**
     * Get all active files
     */
    public List<ChatFile> getAllFiles() throws SQLException {
        String sql = "SELECT * FROM chat_files WHERE is_active = true ORDER BY upload_date DESC";
        
        List<ChatFile> files = new ArrayList<>();
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    files.add(mapResultSetToFile(rs));
                }
            }
        }
        
        return files;
    }
    
    /**
     * Update file information
     */
    public boolean updateFile(ChatFile file) throws SQLException {
        String sql = "UPDATE chat_files SET file_name = ?, original_file_name = ?, " +
                    "description = ? WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, file.getFileName());
            stmt.setString(2, file.getOriginalFileName());
            stmt.setString(3, file.getDescription());
            stmt.setInt(4, file.getId());
            
            return stmt.executeUpdate() > 0;
        }
    }
    
    /**
     * Mark a file as inactive (soft delete)
     */
    public boolean deleteFile(int fileId) throws SQLException {
        String sql = "UPDATE chat_files SET is_active = false WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, fileId);
            return stmt.executeUpdate() > 0;
        }
    }
    
    /**
     * Get files associated with chat messages between two users
     */
    public List<ChatFile> getFilesForChat(String user1Id, String user1Type, 
                                         String user2Id, String user2Type) throws SQLException {
        String sql = "SELECT DISTINCT cf.* FROM chat_files cf " +
                    "INNER JOIN chat_messages cm ON cf.id = cm.file_id " +
                    "WHERE ((cm.sender_id = ? AND cm.sender_type = ? AND cm.receiver_id = ? AND cm.receiver_type = ?) " +
                    "OR (cm.sender_id = ? AND cm.sender_type = ? AND cm.receiver_id = ? AND cm.receiver_type = ?)) " +
                    "AND cf.is_active = true " +
                    "ORDER BY cf.upload_date DESC";
        
        List<ChatFile> files = new ArrayList<>();
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, user1Id);
            stmt.setString(2, user1Type);
            stmt.setString(3, user2Id);
            stmt.setString(4, user2Type);
            stmt.setString(5, user2Id);
            stmt.setString(6, user2Type);
            stmt.setString(7, user1Id);
            stmt.setString(8, user1Type);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    files.add(mapResultSetToFile(rs));
                }
            }
        }
        
        return files;
    }
    
    /**
     * Map ResultSet to ChatFile object
     */
    private ChatFile mapResultSetToFile(ResultSet rs) throws SQLException {
        ChatFile file = new ChatFile();
        file.setId(rs.getInt("id"));
        file.setFileName(rs.getString("file_name"));
        file.setOriginalFileName(rs.getString("original_file_name"));
        file.setFilePath(rs.getString("file_path"));
        file.setFileType(rs.getString("file_type"));
        file.setFileSize(rs.getLong("file_size"));
        file.setUploadedBy(rs.getString("uploaded_by"));
        file.setUploaderType(rs.getString("uploader_type"));
        
        Timestamp uploadTimestamp = rs.getTimestamp("upload_date");
        if (uploadTimestamp != null) {
            file.setUploadDate(uploadTimestamp.toLocalDateTime());
        }
        
        file.setActive(rs.getBoolean("is_active"));
        file.setDescription(rs.getString("description"));
        
        return file;
    }
}