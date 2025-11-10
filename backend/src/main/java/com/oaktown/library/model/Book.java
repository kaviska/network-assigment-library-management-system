package com.oaktown.library.model;

/**
 * Book class extending LibraryItem.
 * Demonstrates inheritance and polymorphism.
 */
public class Book extends LibraryItem {
    
    private static final double DAILY_COST = 0.50;
    
    private int pages;
    private String genre;
    
    public Book(String isbn, String title, String author, int publicationYear, int pages) {
        super(isbn, title, author, publicationYear);
        this.pages = validatePages(pages);
        this.genre = "General";
    }
    
    public Book(String isbn, String title, String author, int publicationYear, int pages, String genre) {
        super(isbn, title, author, publicationYear);
        this.pages = validatePages(pages);
        this.genre = genre != null ? genre : "General";
    }
    
    private int validatePages(int pages) {
        if (pages <= 0) {
            throw new IllegalArgumentException("Number of pages must be positive");
        }
        return pages;
    }
    
    // Implementation of abstract methods from LibraryItem
    @Override
    public double calculateDailyCost() {
        return DAILY_COST;
    }
    
    @Override
    public String getItemType() {
        return "Book";
    }
    
    @Override
    public String getItemDetails() {
        return String.format("Pages: %d, Genre: %s", pages, genre);
    }
    
    // Getters
    public int getPages() {
        return pages;
    }
    
    public String getGenre() {
        return genre;
    }
    
    // Setters
    public void setGenre(String genre) {
        this.genre = genre != null ? genre : "General";
    }
    
    // Business logic specific to books
    public boolean isLongBook() {
        return pages > 500;
    }
    
    public String getBookCategory() {
        if (pages <= 100) return "Short";
        if (pages <= 300) return "Medium";
        if (pages <= 500) return "Long";
        return "Very Long";
    }
    
    // Override toString to include book-specific information
    @Override
    public String toString() {
        return super.toString() + String.format(" (%d pages, %s)", pages, genre);
    }
    
    // Method demonstrating polymorphism - can be overridden in subclasses
    public boolean isReference() {
        return false;
    }
}