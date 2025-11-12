package com.oaktown.library.service;

import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPFile;

import java.io.*;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * FTPFileService implements file sharing functionality using the FTP protocol
 * Provides methods for uploading, downloading, and listing files on an FTP server
 */
public class FTPFileService {
    
    private String server;
    private int port;
    private String username;
    private String password;
    private String uploadDirectory;
    private int timeout;
    
    public FTPFileService() {
        loadConfiguration();
    }
    
    /**
     * Load FTP configuration from config.properties
     */
    private void loadConfiguration() {
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("config.properties")) {
            Properties prop = new Properties();
            prop.load(input);
            
            this.server = prop.getProperty("ftp.server", "localhost");
            this.port = Integer.parseInt(prop.getProperty("ftp.port", "21"));
            this.username = prop.getProperty("ftp.username", "anonymous");
            this.password = prop.getProperty("ftp.password", "");
            this.uploadDirectory = prop.getProperty("ftp.upload.directory", "/uploads");
            this.timeout = Integer.parseInt(prop.getProperty("ftp.timeout", "30000"));
            
        } catch (IOException e) {
            // Use default values if config file cannot be read
            this.server = "localhost";
            this.port = 21;
            this.username = "anonymous";
            this.password = "";
            this.uploadDirectory = "/uploads";
            this.timeout = 30000;
            System.err.println("Warning: Could not load FTP configuration, using defaults: " + e.getMessage());
        }
    }
    
    /**
     * Upload a file to the FTP server
     * @param localFile The local file to upload
     * @param remoteFileName The name to give the file on the server
     * @param subDirectory Optional subdirectory (null for root upload directory)
     * @return FileUploadResult containing success status and file info
     */
    public FileUploadResult uploadFile(File localFile, String remoteFileName, String subDirectory) {
        FTPClient ftpClient = new FTPClient();
        
        try {
            // Connect to FTP server
            connectToServer(ftpClient);
            
            // Navigate to upload directory
            String targetDirectory = uploadDirectory;
            if (subDirectory != null && !subDirectory.trim().isEmpty()) {
                targetDirectory = uploadDirectory + "/" + subDirectory.trim();
            }
            
            // Create directory if it doesn't exist
            createDirectoryIfNotExists(ftpClient, targetDirectory);
            
            // Change to target directory
            if (!ftpClient.changeWorkingDirectory(targetDirectory)) {
                throw new IOException("Failed to change to directory: " + targetDirectory);
            }
            
            // Set file transfer mode to binary
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            ftpClient.enterLocalPassiveMode();
            
            // Upload the file
            try (FileInputStream inputStream = new FileInputStream(localFile)) {
                boolean uploaded = ftpClient.storeFile(remoteFileName, inputStream);
                
                if (uploaded) {
                    long fileSize = localFile.length();
                    return new FileUploadResult(true, remoteFileName, targetDirectory + "/" + remoteFileName, 
                                              fileSize, "File uploaded successfully");
                } else {
                    return new FileUploadResult(false, remoteFileName, null, 0, 
                                              "Upload failed: " + ftpClient.getReplyString());
                }
            }
            
        } catch (Exception e) {
            return new FileUploadResult(false, remoteFileName, null, 0, 
                                      "Upload error: " + e.getMessage());
        } finally {
            disconnectFromServer(ftpClient);
        }
    }
    
    /**
     * Upload a file from byte array
     * @param fileData The file data as byte array
     * @param fileName The name to give the file on the server
     * @param subDirectory Optional subdirectory (null for root upload directory)
     * @return FileUploadResult containing success status and file info
     */
    public FileUploadResult uploadFile(byte[] fileData, String fileName, String subDirectory) {
        FTPClient ftpClient = new FTPClient();
        
        String targetDirectory = uploadDirectory;
        if (subDirectory != null && !subDirectory.trim().isEmpty()) {
            targetDirectory = uploadDirectory + "/" + subDirectory.trim();
        }

        // First, try to upload via FTP. If connection fails, fall back to saving locally
        try {
            // Connect to FTP server
            connectToServer(ftpClient);

            // Create remote directory if needed
            createDirectoryIfNotExists(ftpClient, targetDirectory);

            // Change to target directory
            if (!ftpClient.changeWorkingDirectory(targetDirectory)) {
                throw new IOException("Failed to change to directory: " + targetDirectory);
            }

            // Set file transfer mode to binary
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            ftpClient.enterLocalPassiveMode();

            // Upload the file
            try (ByteArrayInputStream inputStream = new ByteArrayInputStream(fileData)) {
                boolean uploaded = ftpClient.storeFile(fileName, inputStream);

                if (uploaded) {
                    long fileSize = fileData.length;
                    return new FileUploadResult(true, fileName, targetDirectory + "/" + fileName,
                            fileSize, "File uploaded successfully");
                } else {
                    return new FileUploadResult(false, fileName, null, 0,
                            "Upload failed: " + ftpClient.getReplyString());
                }
            }

        } catch (Exception e) {
            // If the exception is a connection/login issue, attempt local fallback
            System.err.println("FTP upload error: " + e.getMessage());
            e.printStackTrace();

            try {
                // Save locally under backend/target/local_uploads/<subDirectory>
                String baseLocal = System.getProperty("user.dir") + File.separator + "target" + File.separator + "local_uploads";
                String localDir = baseLocal + File.separator + (subDirectory != null ? subDirectory.replace("/", File.separator) : "");

                File dir = new File(localDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                File outFile = new File(dir, fileName);
                try (FileOutputStream fos = new FileOutputStream(outFile)) {
                    fos.write(fileData);
                }

                long fileSize = fileData.length;
                String localPath = outFile.getAbsolutePath();
                String remotePath = "local:" + localPath; // indicate saved locally

                System.err.println("Saved file locally due to FTP error: " + localPath);

                return new FileUploadResult(true, fileName, remotePath, fileSize,
                        "File saved locally (FTP unavailable)");
            } catch (Exception ex) {
                System.err.println("Local fallback save failed: " + ex.getMessage());
                ex.printStackTrace();
                return new FileUploadResult(false, fileName, null, 0,
                        "Upload error: " + e.getMessage());
            }
        } finally {
            disconnectFromServer(ftpClient);
        }
    }
    
    /**
     * Download a file from the FTP server
     * @param remoteFilePath The full path to the remote file
     * @param localDestination The local file destination
     * @return FileDownloadResult containing success status and file info
     */
    public FileDownloadResult downloadFile(String remoteFilePath, File localDestination) {
        FTPClient ftpClient = new FTPClient();
        
        try {
            // Connect to FTP server
            connectToServer(ftpClient);
            
            // Set file transfer mode to binary
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            ftpClient.enterLocalPassiveMode();
            
            // Download the file
            try (FileOutputStream outputStream = new FileOutputStream(localDestination)) {
                boolean downloaded = ftpClient.retrieveFile(remoteFilePath, outputStream);
                
                if (downloaded) {
                    long fileSize = localDestination.length();
                    return new FileDownloadResult(true, remoteFilePath, localDestination.getAbsolutePath(), 
                                                fileSize, "File downloaded successfully");
                } else {
                    return new FileDownloadResult(false, remoteFilePath, (String)null, 0, 
                                                "Download failed: " + ftpClient.getReplyString());
                }
            }
            
        } catch (Exception e) {
            return new FileDownloadResult(false, remoteFilePath, (String)null, 0, 
                                        "Download error: " + e.getMessage());
        } finally {
            disconnectFromServer(ftpClient);
        }
    }
    
    /**
     * Download a file as byte array
     * @param remoteFilePath The full path to the remote file
     * @return FileDownloadResult containing success status and file data
     */
    public FileDownloadResult downloadFileAsBytes(String remoteFilePath) {
        FTPClient ftpClient = new FTPClient();
        
        try {
            // Connect to FTP server
            connectToServer(ftpClient);
            
            // Set file transfer mode to binary
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            ftpClient.enterLocalPassiveMode();
            
            // Download the file to byte array
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                boolean downloaded = ftpClient.retrieveFile(remoteFilePath, outputStream);
                
                if (downloaded) {
                    byte[] fileData = outputStream.toByteArray();
                    return new FileDownloadResult(true, remoteFilePath, fileData, 
                                                fileData.length, "File downloaded successfully");
                } else {
                    return new FileDownloadResult(false, remoteFilePath, (byte[])null, 0, 
                                                "Download failed: " + ftpClient.getReplyString());
                }
            }
            
        } catch (Exception e) {
            return new FileDownloadResult(false, remoteFilePath, (byte[])null, 0, 
                                        "Download error: " + e.getMessage());
        } finally {
            disconnectFromServer(ftpClient);
        }
    }
    
    /**
     * List files in a directory
     * @param directory The directory to list (null for upload directory)
     * @return List of FileInfo objects
     */
    public List<FileInfo> listFiles(String directory) {
        FTPClient ftpClient = new FTPClient();
        List<FileInfo> fileList = new ArrayList<>();
        
        try {
            // Connect to FTP server
            connectToServer(ftpClient);
            
            // Navigate to directory
            String targetDirectory = directory != null ? directory : uploadDirectory;
            
            if (!ftpClient.changeWorkingDirectory(targetDirectory)) {
                throw new IOException("Failed to change to directory: " + targetDirectory);
            }
            
            // List files
            FTPFile[] files = ftpClient.listFiles();
            
            for (FTPFile file : files) {
                if (file.isFile()) {
                    FileInfo fileInfo = new FileInfo(
                        file.getName(),
                        targetDirectory + "/" + file.getName(),
                        file.getSize(),
                        file.getTimestamp().getTimeInMillis(),
                        file.getType() == FTPFile.FILE_TYPE
                    );
                    fileList.add(fileInfo);
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error listing files: " + e.getMessage());
        } finally {
            disconnectFromServer(ftpClient);
        }
        
        return fileList;
    }
    
    /**
     * Delete a file from the FTP server
     * @param remoteFilePath The full path to the remote file
     * @return true if the file was deleted successfully
     */
    public boolean deleteFile(String remoteFilePath) {
        FTPClient ftpClient = new FTPClient();
        
        try {
            // Connect to FTP server
            connectToServer(ftpClient);
            
            // Delete the file
            boolean deleted = ftpClient.deleteFile(remoteFilePath);
            
            if (!deleted) {
                System.err.println("Delete failed: " + ftpClient.getReplyString());
            }
            
            return deleted;
            
        } catch (Exception e) {
            System.err.println("Delete error: " + e.getMessage());
            return false;
        } finally {
            disconnectFromServer(ftpClient);
        }
    }
    
    /**
     * Connect to FTP server
     */
    private void connectToServer(FTPClient ftpClient) throws SocketException, IOException {
        ftpClient.setConnectTimeout(timeout);
        ftpClient.connect(server, port);
        
        if (!ftpClient.login(username, password)) {
            throw new IOException("Failed to login to FTP server");
        }
        
        ftpClient.enterLocalPassiveMode();
    }
    
    /**
     * Disconnect from FTP server
     */
    private void disconnectFromServer(FTPClient ftpClient) {
        try {
            if (ftpClient.isConnected()) {
                ftpClient.logout();
                ftpClient.disconnect();
            }
        } catch (IOException e) {
            // Ignore errors during disconnect
        }
    }
    
    /**
     * Create directory if it doesn't exist
     */
    private void createDirectoryIfNotExists(FTPClient ftpClient, String directory) throws IOException {
        String[] parts = directory.split("/");
        String currentPath = "";
        
        for (String part : parts) {
            if (part.isEmpty()) continue;
            
            currentPath += "/" + part;
            
            if (!ftpClient.changeWorkingDirectory(currentPath)) {
                if (!ftpClient.makeDirectory(currentPath)) {
                    // Try to continue anyway - directory might already exist
                }
            }
        }
    }
    
    /**
     * File upload result class
     */
    public static class FileUploadResult {
        private final boolean success;
        private final String fileName;
        private final String remotePath;
        private final long fileSize;
        private final String message;
        
        public FileUploadResult(boolean success, String fileName, String remotePath, long fileSize, String message) {
            this.success = success;
            this.fileName = fileName;
            this.remotePath = remotePath;
            this.fileSize = fileSize;
            this.message = message;
        }
        
        // Getters
        public boolean isSuccess() { return success; }
        public String getFileName() { return fileName; }
        public String getRemotePath() { return remotePath; }
        public long getFileSize() { return fileSize; }
        public String getMessage() { return message; }
    }
    
    /**
     * File download result class
     */
    public static class FileDownloadResult {
        private final boolean success;
        private final String remoteFilePath;
        private final String localPath;
        private final byte[] fileData;
        private final long fileSize;
        private final String message;
        
        public FileDownloadResult(boolean success, String remoteFilePath, String localPath, long fileSize, String message) {
            this.success = success;
            this.remoteFilePath = remoteFilePath;
            this.localPath = localPath;
            this.fileData = null;
            this.fileSize = fileSize;
            this.message = message;
        }
        
        public FileDownloadResult(boolean success, String remoteFilePath, byte[] fileData, long fileSize, String message) {
            this.success = success;
            this.remoteFilePath = remoteFilePath;
            this.localPath = null;
            this.fileData = fileData;
            this.fileSize = fileSize;
            this.message = message;
        }
        
        // Getters
        public boolean isSuccess() { return success; }
        public String getRemoteFilePath() { return remoteFilePath; }
        public String getLocalPath() { return localPath; }
        public byte[] getFileData() { return fileData; }
        public long getFileSize() { return fileSize; }
        public String getMessage() { return message; }
    }
    
    /**
     * File information class
     */
    public static class FileInfo {
        private final String name;
        private final String fullPath;
        private final long size;
        private final long lastModified;
        private final boolean isFile;
        
        public FileInfo(String name, String fullPath, long size, long lastModified, boolean isFile) {
            this.name = name;
            this.fullPath = fullPath;
            this.size = size;
            this.lastModified = lastModified;
            this.isFile = isFile;
        }
        
        // Getters
        public String getName() { return name; }
        public String getFullPath() { return fullPath; }
        public long getSize() { return size; }
        public long getLastModified() { return lastModified; }
        public boolean isFile() { return isFile; }
    }
}