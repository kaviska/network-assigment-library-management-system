package com.oaktown.library.model;

import java.time.LocalDate;
import java.util.Objects;

/**
 * Abstract base class representing a library item.
 * Demonstrates abstraction and encapsulation principles.
 * All library items must extend this class.
 */
public abstract class LibraryItem {
    
    // Private fields demonstrating encapsulation
    private String isbn;
    private String title;
    private String author;
    private int publicationYear;
    private String currentBorrower; // Member ID or null if available
    private boolean available;
    
    // Protected constructor for inheritance
    protected LibraryItem(String isbn, String title, String author, int publicationYear) {
        this.isbn = Objects.requireNonNull(isbn, "ISBN cannot be null");
        this.title = Objects.requireNonNull(title, "Title cannot be null");
        this.author = Objects.requireNonNull(author, "Author cannot be null");
        this.publicationYear = publicationYear;
        this.available = true;
        this.currentBorrower = null;
    }
    
    // Abstract method demonstrating abstraction - must be implemented by subclasses
    public abstract double calculateDailyCost();
    
    // Abstract method for item type identification
    public abstract String getItemType();
    
    // Abstract method for getting item-specific information
    public abstract String getItemDetails();
    
    // Template method pattern - defines the algorithm structure
    public final double calculateTotalCost(int days) {
        if (days <= 0) {
            throw new IllegalArgumentException("Number of days must be positive");
        }
        return calculateDailyCost() * days;
    }
    
    // Public getters (encapsulation)
    public String getIsbn() {
        return isbn;
    }
    
    public String getTitle() {
        return title;
    }
    
    public String getAuthor() {
        return author;
    }
    
    public int getPublicationYear() {
        return publicationYear;
    }
    
    public String getCurrentBorrower() {
        return currentBorrower;
    }
    
    public boolean isAvailable() {
        return available;
    }
    
    // Protected setters for subclass access
    protected void setCurrentBorrower(String memberId) {
        this.currentBorrower = memberId;
        this.available = (memberId == null);
    }
    
    // Public method for DAO access
    public void setBorrowerForDAO(String memberId) {
        this.currentBorrower = memberId;
        this.available = (memberId == null);
    }
    
    protected void setAvailable(boolean available) {
        this.available = available;
        if (available) {
            this.currentBorrower = null;
        }
    }
    
    // Business logic methods
    public boolean canBeBorrowed() {
        return isAvailable();
    }
    
    public void borrowItem(String memberId) {
        if (!canBeBorrowed()) {
            throw new IllegalStateException("Item is not available for borrowing");
        }
        if (memberId == null || memberId.trim().isEmpty()) {
            throw new IllegalArgumentException("Member ID cannot be null or empty");
        }
        setCurrentBorrower(memberId);
    }
    
    public void returnItem() {
        if (isAvailable()) {
            throw new IllegalStateException("Item is not currently borrowed");
        }
        setCurrentBorrower(null);
    }
    
    // Override equals and hashCode for proper object comparison
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        LibraryItem that = (LibraryItem) obj;
        return Objects.equals(isbn, that.isbn);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(isbn);
    }
    
    // toString method for string representation
    @Override
    public String toString() {
        return String.format("%s: \"%s\" by %s (%d) [%s] - %s", 
                getItemType(), title, author, publicationYear, isbn,
                available ? "Available" : "Borrowed by " + currentBorrower);
    }
    
    // Additional utility method
    public int getAge() {
        return LocalDate.now().getYear() - publicationYear;
    }
}