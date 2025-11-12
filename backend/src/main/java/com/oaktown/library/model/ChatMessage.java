package com.oaktown.library.model;

import java.time.LocalDateTime;

public class ChatMessage {
    private int id;
    private String senderType; // "ADMIN" or "MEMBER"
    private String senderId;
    private String senderName;
    private String receiverType; // "ADMIN" or "MEMBER"
    private String receiverId;
    private String receiverName;
    private String message;
    private LocalDateTime timestamp;
    private boolean isRead;
    private Integer fileId; // Reference to ChatFile if this message contains a file
    private String messageType; // "TEXT" or "FILE"

    public ChatMessage() {
    }

    public ChatMessage(String senderType, String senderId, String senderName,
                      String receiverType, String receiverId, String receiverName,
                      String message) {
        this.senderType = senderType;
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverType = receiverType;
        this.receiverId = receiverId;
        this.receiverName = receiverName;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
        this.messageType = "TEXT";
    }
    
    public ChatMessage(String senderType, String senderId, String senderName,
                      String receiverType, String receiverId, String receiverName,
                      String message, Integer fileId, String messageType) {
        this.senderType = senderType;
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverType = receiverType;
        this.receiverId = receiverId;
        this.receiverName = receiverName;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
        this.fileId = fileId;
        this.messageType = messageType != null ? messageType : "TEXT";
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getReceiverType() {
        return receiverType;
    }

    public void setReceiverType(String receiverType) {
        this.receiverType = receiverType;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }
    
    public Integer getFileId() {
        return fileId;
    }
    
    public void setFileId(Integer fileId) {
        this.fileId = fileId;
    }
    
    public String getMessageType() {
        return messageType;
    }
    
    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    @Override
    public String toString() {
        return "ChatMessage{" +
                "id=" + id +
                ", senderType='" + senderType + '\'' +
                ", senderId='" + senderId + '\'' +
                ", senderName='" + senderName + '\'' +
                ", receiverType='" + receiverType + '\'' +
                ", receiverId='" + receiverId + '\'' +
                ", receiverName='" + receiverName + '\'' +
                ", message='" + message + '\'' +
                ", timestamp=" + timestamp +
                ", isRead=" + isRead +
                ", fileId=" + fileId +
                ", messageType='" + messageType + '\'' +
                '}';
    }
}
