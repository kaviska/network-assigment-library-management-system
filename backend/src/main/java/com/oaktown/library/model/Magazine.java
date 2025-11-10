package com.oaktown.library.model;

/**
 * Magazine class extending LibraryItem.
 * Demonstrates inheritance and polymorphism.
 */
public class Magazine extends LibraryItem {
    
    private static final double DAILY_COST = 0.25;
    
    private int issueNumber;
    private int volume;
    private String frequency; // weekly, monthly, quarterly, etc.
    
    public Magazine(String isbn, String title, String author, int publicationYear, int issueNumber) {
        super(isbn, title, author, publicationYear);
        this.issueNumber = validateIssueNumber(issueNumber);
        this.volume = 1;
        this.frequency = "Monthly";
    }
    
    public Magazine(String isbn, String title, String author, int publicationYear, 
                   int issueNumber, int volume, String frequency) {
        super(isbn, title, author, publicationYear);
        this.issueNumber = validateIssueNumber(issueNumber);
        this.volume = validateVolume(volume);
        this.frequency = frequency != null ? frequency : "Monthly";
    }
    
    private int validateIssueNumber(int issueNumber) {
        if (issueNumber <= 0) {
            throw new IllegalArgumentException("Issue number must be positive");
        }
        return issueNumber;
    }
    
    private int validateVolume(int volume) {
        if (volume <= 0) {
            throw new IllegalArgumentException("Volume must be positive");
        }
        return volume;
    }
    
    // Implementation of abstract methods from LibraryItem
    @Override
    public double calculateDailyCost() {
        return DAILY_COST;
    }
    
    @Override
    public String getItemType() {
        return "Magazine";
    }
    
    @Override
    public String getItemDetails() {
        return String.format("Issue: %d, Volume: %d, Frequency: %s", 
                issueNumber, volume, frequency);
    }
    
    // Getters
    public int getIssueNumber() {
        return issueNumber;
    }
    
    public int getVolume() {
        return volume;
    }
    
    public String getFrequency() {
        return frequency;
    }
    
    // Setters
    public void setIssueNumber(int issueNumber) {
        this.issueNumber = validateIssueNumber(issueNumber);
    }
    
    public void setVolume(int volume) {
        this.volume = validateVolume(volume);
    }
    
    public void setFrequency(String frequency) {
        this.frequency = frequency != null ? frequency : "Monthly";
    }
    
    // Magazine-specific business logic
    public boolean isCurrentIssue() {
        // Simplified logic - in real scenario would check against current date
        return issueNumber >= getCurrentExpectedIssue();
    }
    
    private int getCurrentExpectedIssue() {
        // Simplified calculation based on frequency
        int currentYear = java.time.LocalDate.now().getYear();
        int yearsSincePublication = currentYear - getPublicationYear();
        
        switch (frequency.toLowerCase()) {
            case "weekly":
                return yearsSincePublication * 52 + issueNumber;
            case "monthly":
                return yearsSincePublication * 12 + issueNumber;
            case "quarterly":
                return yearsSincePublication * 4 + issueNumber;
            default:
                return issueNumber;
        }
    }
    
    public boolean isArchiveIssue() {
        return !isCurrentIssue();
    }
    
    public String getMagazineIdentifier() {
        return String.format("Vol.%d No.%d", volume, issueNumber);
    }
    
    // Business rule: magazines have shorter borrowing periods
    public int getMaxBorrowDays() {
        switch (frequency.toLowerCase()) {
            case "weekly":
                return 7;
            case "monthly":
                return 14;
            case "quarterly":
                return 21;
            default:
                return 14;
        }
    }
    
    // Override toString to include magazine-specific information
    @Override
    public String toString() {
        return super.toString() + String.format(" (Vol.%d No.%d, %s)", 
                volume, issueNumber, frequency);
    }
    
    // Magazine frequency types as enum-like constants
    public static class Frequency {
        public static final String WEEKLY = "Weekly";
        public static final String MONTHLY = "Monthly";
        public static final String QUARTERLY = "Quarterly";
        public static final String ANNUAL = "Annual";
    }
}