package com.oaktown.library.model;

/**
 * ReferenceBook class extending Book.
 * Demonstrates inheritance hierarchy and method overriding.
 */
public class ReferenceBook extends Book {
    
    private static final double DAILY_COST = 1.00;
    
    private boolean restricted;
    
    public ReferenceBook(String isbn, String title, String author, int publicationYear, 
                        int pages, boolean restricted) {
        super(isbn, title, author, publicationYear, pages, "Reference");
        this.restricted = restricted;
    }
    
    public ReferenceBook(String isbn, String title, String author, int publicationYear, 
                        int pages, String genre, boolean restricted) {
        super(isbn, title, author, publicationYear, pages, genre);
        this.restricted = restricted;
    }
    
    // Override abstract methods from LibraryItem
    @Override
    public double calculateDailyCost() {
        return DAILY_COST;
    }
    
    @Override
    public String getItemType() {
        return "Reference Book";
    }
    
    @Override
    public String getItemDetails() {
        return String.format("%s, Restricted: %s", super.getItemDetails(), 
                restricted ? "Yes" : "No");
    }
    
    // Override method from Book class
    @Override
    public boolean isReference() {
        return true;
    }
    
    // Override canBeBorrowed to check restriction
    @Override
    public boolean canBeBorrowed() {
        return super.canBeBorrowed() && !restricted;
    }
    
    // Override borrowItem to enforce restriction
    @Override
    public void borrowItem(String memberId) {
        if (restricted) {
            throw new IllegalStateException("Reference book is restricted and cannot be borrowed");
        }
        super.borrowItem(memberId);
    }
    
    // Getter for restricted status
    public boolean isRestricted() {
        return restricted;
    }
    
    // Setter for restricted status
    public void setRestricted(boolean restricted) {
        this.restricted = restricted;
        // If currently borrowed and being set to restricted, this is a business rule violation
        if (restricted && !isAvailable()) {
            throw new IllegalStateException("Cannot restrict a book that is currently borrowed");
        }
    }
    
    // Reference book specific methods
    public String getAccessLevel() {
        return restricted ? "In-Library Use Only" : "Borrowable";
    }
    
    public boolean isInLibraryUseOnly() {
        return restricted;
    }
    
    // Override toString to include restriction information
    @Override
    public String toString() {
        String baseString = super.toString();
        return baseString + (restricted ? " [RESTRICTED]" : " [BORROWABLE]");
    }
    
    // Business logic for reference books
    public boolean requiresSpecialHandling() {
        return restricted || getPages() > 1000;
    }
}