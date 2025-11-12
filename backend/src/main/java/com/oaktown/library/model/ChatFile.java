package com.oaktown.library.model;

import java.time.LocalDateTime;

/**
 * File entity representing file metadata stored in the database
 * Used for tracking files shared in chat messages
 */
public class ChatFile {
    private int id;
    private String fileName;
    private String originalFileName;
    private String filePath;
    private String fileType;
    private long fileSize;
    private String uploadedBy;
    private String uploaderType; // "ADMIN" or "MEMBER"
    private LocalDateTime uploadDate;
    private boolean isActive;
    private String description;
    
    public ChatFile() {
    }
    
    public ChatFile(String fileName, String originalFileName, String filePath, 
                   String fileType, long fileSize, String uploadedBy, String uploaderType) {
        this.fileName = fileName;
        this.originalFileName = originalFileName;
        this.filePath = filePath;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploadedBy = uploadedBy;
        this.uploaderType = uploaderType;
        this.uploadDate = LocalDateTime.now();
        this.isActive = true;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public String getUploaderType() {
        return uploaderType;
    }

    public void setUploaderType(String uploaderType) {
        this.uploaderType = uploaderType;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
    
    @Override
    public String toString() {
        return "ChatFile{" +
                "id=" + id +
                ", fileName='" + fileName + '\'' +
                ", originalFileName='" + originalFileName + '\'' +
                ", filePath='" + filePath + '\'' +
                ", fileType='" + fileType + '\'' +
                ", fileSize=" + fileSize +
                ", uploadedBy='" + uploadedBy + '\'' +
                ", uploaderType='" + uploaderType + '\'' +
                ", uploadDate=" + uploadDate +
                ", isActive=" + isActive +
                ", description='" + description + '\'' +
                '}';
    }
}