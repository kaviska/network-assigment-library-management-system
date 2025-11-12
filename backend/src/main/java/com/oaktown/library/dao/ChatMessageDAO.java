package com.oaktown.library.dao;

import com.oaktown.library.model.ChatMessage;
import com.oaktown.library.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ChatMessageDAO {

    /**
     * Save a new chat message to database
     */
    public boolean saveMessage(ChatMessage message) {
        String sql = "INSERT INTO chat_messages (sender_type, sender_id, sender_name, " +
                     "receiver_type, receiver_id, receiver_name, message) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, message.getSenderType());
            stmt.setString(2, message.getSenderId());
            stmt.setString(3, message.getSenderName());
            stmt.setString(4, message.getReceiverType());
            stmt.setString(5, message.getReceiverId());
            stmt.setString(6, message.getReceiverName());
            stmt.setString(7, message.getMessage());
            
            int affectedRows = stmt.executeUpdate();
            
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        message.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
            return false;
            
        } catch (SQLException e) {
            System.err.println("Error saving chat message: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Get all messages between two users (conversation history)
     */
    public List<ChatMessage> getConversation(String userId1, String userType1, 
                                             String userId2, String userType2) {
        List<ChatMessage> messages = new ArrayList<>();
        String sql = "SELECT * FROM chat_messages " +
                     "WHERE (sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?) " +
                     "OR (sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?) " +
                     "ORDER BY timestamp ASC";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId1);
            stmt.setString(2, userType1);
            stmt.setString(3, userId2);
            stmt.setString(4, userType2);
            stmt.setString(5, userId2);
            stmt.setString(6, userType2);
            stmt.setString(7, userId1);
            stmt.setString(8, userType1);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    messages.add(mapResultSetToMessage(rs));
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting conversation: " + e.getMessage());
            e.printStackTrace();
        }
        
        return messages;
    }

    /**
     * Get all conversations for a specific user
     */
    public List<ChatMessage> getLatestMessagesForUser(String userId, String userType) {
        List<ChatMessage> messages = new ArrayList<>();
        String sql = "SELECT cm1.* FROM chat_messages cm1 " +
                     "INNER JOIN ( " +
                     "    SELECT " +
                     "        CASE " +
                     "            WHEN sender_id = ? AND sender_type = ? THEN receiver_id " +
                     "            ELSE sender_id " +
                     "        END as other_user_id, " +
                     "        CASE " +
                     "            WHEN sender_id = ? AND sender_type = ? THEN receiver_type " +
                     "            ELSE sender_type " +
                     "        END as other_user_type, " +
                     "        MAX(timestamp) as latest_time " +
                     "    FROM chat_messages " +
                     "    WHERE (sender_id = ? AND sender_type = ?) OR (receiver_id = ? AND receiver_type = ?) " +
                     "    GROUP BY other_user_id, other_user_type " +
                     ") cm2 " +
                     "ON ((cm1.sender_id = ? AND cm1.sender_type = ? AND cm1.receiver_id = cm2.other_user_id AND cm1.receiver_type = cm2.other_user_type) " +
                     "    OR (cm1.receiver_id = ? AND cm1.receiver_type = ? AND cm1.sender_id = cm2.other_user_id AND cm1.sender_type = cm2.other_user_type)) " +
                     "   AND cm1.timestamp = cm2.latest_time " +
                     "ORDER BY cm1.timestamp DESC";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, userId);
            stmt.setString(2, userType);
            stmt.setString(3, userId);
            stmt.setString(4, userType);
            stmt.setString(5, userId);
            stmt.setString(6, userType);
            stmt.setString(7, userId);
            stmt.setString(8, userType);
            stmt.setString(9, userId);
            stmt.setString(10, userType);
            stmt.setString(11, userId);
            stmt.setString(12, userType);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    messages.add(mapResultSetToMessage(rs));
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Error getting latest messages: " + e.getMessage());
            e.printStackTrace();
        }
        
        return messages;
    }

    /**
     * Mark messages as read
     */
    public boolean markMessagesAsRead(String receiverId, String receiverType, 
                                     String senderId, String senderType) {
        String sql = "UPDATE chat_messages SET is_read = TRUE " +
                     "WHERE receiver_id = ? AND receiver_type = ? " +
                     "AND sender_id = ? AND sender_type = ? " +
                     "AND is_read = FALSE";
        
        try (Connection conn = DatabaseConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, receiverId);
            stmt.setString(2, receiverType);
            stmt.setString(3, senderId);
            stmt.setString(4, senderType);
            
            stmt.executeUpdate();
            return true;
            
        } catch (SQLException e) {
            System.err.println("Error marking messages as read: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Helper method to map ResultSet to ChatMessage
     */
    private ChatMessage mapResultSetToMessage(ResultSet rs) throws SQLException {
        ChatMessage message = new ChatMessage();
        message.setId(rs.getInt("id"));
        message.setSenderType(rs.getString("sender_type"));
        message.setSenderId(rs.getString("sender_id"));
        message.setSenderName(rs.getString("sender_name"));
        message.setReceiverType(rs.getString("receiver_type"));
        message.setReceiverId(rs.getString("receiver_id"));
        message.setReceiverName(rs.getString("receiver_name"));
        message.setMessage(rs.getString("message"));
        message.setTimestamp(rs.getTimestamp("timestamp").toLocalDateTime());
        message.setRead(rs.getBoolean("is_read"));
        return message;
    }
}
