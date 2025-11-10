package com.oaktown.library.util;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Database connection utility class using Singleton pattern.
 * Manages database connections for the library system.
 */
public class DatabaseConnection {
    
    private static DatabaseConnection instance;
    private static final String CONFIG_FILE = "config.properties";
    
    private String url;
    private String username;
    private String password;
    private String driver;
    
    // Private constructor for Singleton pattern
    private DatabaseConnection() {
        loadDatabaseConfig();
    }
    
    // Singleton getInstance method
    public static synchronized DatabaseConnection getInstance() {
        if (instance == null) {
            instance = new DatabaseConnection();
        }
        return instance;
    }
    
    /**
     * Load database configuration from properties file
     */
    private void loadDatabaseConfig() {
        Properties props = new Properties();
        try (InputStream input = getClass().getClassLoader().getResourceAsStream(CONFIG_FILE)) {
            if (input == null) {
                throw new RuntimeException("Unable to find " + CONFIG_FILE);
            }
            props.load(input);
            
            this.url = props.getProperty("db.url");
            this.username = props.getProperty("db.username");
            this.password = props.getProperty("db.password");
            this.driver = props.getProperty("db.driver");
            
            // Load the MySQL driver
            Class.forName(driver);
            
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException("Failed to load database configuration", e);
        }
    }
    
    /**
     * Get a database connection
     * @return Connection object
     * @throws SQLException if connection fails
     */
    public Connection getConnection() throws SQLException {
        try {
            Connection conn = DriverManager.getConnection(url, username, password);
            conn.setAutoCommit(true); // Default to auto-commit
            return conn;
        } catch (SQLException e) {
            System.err.println("Failed to connect to database: " + e.getMessage());
            throw e;
        }
    }
    
    /**
     * Test the database connection
     * @return true if connection successful, false otherwise
     */
    public boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("Database connection test failed: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Close a connection safely
     * @param conn Connection to close
     */
    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                System.err.println("Failed to close connection: " + e.getMessage());
            }
        }
    }
    
    /**
     * Get database URL (for testing purposes)
     */
    public String getUrl() {
        return url;
    }
    
    /**
     * Create database connection with transaction support
     * @return Connection with auto-commit disabled
     * @throws SQLException if connection fails
     */
    public Connection getTransactionConnection() throws SQLException {
        Connection conn = getConnection();
        conn.setAutoCommit(false);
        return conn;
    }
    
    /**
     * Commit transaction and close connection
     * @param conn Connection to commit and close
     */
    public static void commitAndClose(Connection conn) {
        if (conn != null) {
            try {
                conn.commit();
                conn.close();
            } catch (SQLException e) {
                System.err.println("Failed to commit and close connection: " + e.getMessage());
                try {
                    conn.rollback();
                    conn.close();
                } catch (SQLException rollbackException) {
                    System.err.println("Failed to rollback: " + rollbackException.getMessage());
                }
            }
        }
    }
    
    /**
     * Rollback transaction and close connection
     * @param conn Connection to rollback and close
     */
    public static void rollbackAndClose(Connection conn) {
        if (conn != null) {
            try {
                conn.rollback();
                conn.close();
            } catch (SQLException e) {
                System.err.println("Failed to rollback and close connection: " + e.getMessage());
            }
        }
    }
}