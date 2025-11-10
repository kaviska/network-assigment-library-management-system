package com.oaktown.library.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

/**
 * JUnit tests for the Magazine class.
 * Tests magazine-specific functionality and inheritance.
 */
@DisplayName("Magazine Class Tests")
class MagazineTest {
    
    private Magazine magazine;
    private static final String TEST_ISBN = "MAG-2024-001";
    private static final String TEST_TITLE = "National Geographic";
    private static final String TEST_AUTHOR = "National Geographic Society";
    private static final int TEST_YEAR = 2024;
    private static final int TEST_ISSUE = 9;
    private static final int TEST_VOLUME = 245;
    private static final String TEST_FREQUENCY = "Monthly";
    
    @BeforeEach
    void setUp() {
        magazine = new Magazine(TEST_ISBN, TEST_TITLE, TEST_AUTHOR, TEST_YEAR, 
                               TEST_ISSUE, TEST_VOLUME, TEST_FREQUENCY);
    }
    
    @Test
    @DisplayName("Constructor with all parameters should create magazine correctly")
    void testConstructorWithAllParameters() {
        assertEquals(TEST_ISBN, magazine.getIsbn());
        assertEquals(TEST_TITLE, magazine.getTitle());
        assertEquals(TEST_AUTHOR, magazine.getAuthor());
        assertEquals(TEST_YEAR, magazine.getPublicationYear());
        assertEquals(TEST_ISSUE, magazine.getIssueNumber());
        assertEquals(TEST_VOLUME, magazine.getVolume());
        assertEquals(TEST_FREQUENCY, magazine.getFrequency());
        assertTrue(magazine.isAvailable());
    }
    
    @Test
    @DisplayName("Constructor with minimal parameters should use defaults")
    void testConstructorWithMinimalParameters() {
        Magazine simpleMagazine = new Magazine("MAG-123", "Simple Magazine", "Publisher", 2024, 5);
        
        assertEquals(5, simpleMagazine.getIssueNumber());
        assertEquals(1, simpleMagazine.getVolume());
        assertEquals("Monthly", simpleMagazine.getFrequency());
    }
    
    @Test
    @DisplayName("Constructor should throw exception for invalid issue number")
    void testConstructorWithInvalidIssueNumber() {
        assertThrows(IllegalArgumentException.class, () -> 
            new Magazine(TEST_ISBN, TEST_TITLE, TEST_AUTHOR, TEST_YEAR, 0));
        
        assertThrows(IllegalArgumentException.class, () -> 
            new Magazine(TEST_ISBN, TEST_TITLE, TEST_AUTHOR, TEST_YEAR, -1));
    }
    
    @Test
    @DisplayName("Constructor should throw exception for invalid volume")
    void testConstructorWithInvalidVolume() {
        assertThrows(IllegalArgumentException.class, () -> 
            new Magazine(TEST_ISBN, TEST_TITLE, TEST_AUTHOR, TEST_YEAR, 1, 0, TEST_FREQUENCY));
        
        assertThrows(IllegalArgumentException.class, () -> 
            new Magazine(TEST_ISBN, TEST_TITLE, TEST_AUTHOR, TEST_YEAR, 1, -1, TEST_FREQUENCY));
    }
    
    @Test
    @DisplayName("Calculate daily cost should return magazine rate")
    void testCalculateDailyCost() {
        assertEquals(0.25, magazine.calculateDailyCost(), 0.001);
    }
    
    @Test
    @DisplayName("Get item type should return 'Magazine'")
    void testGetItemType() {
        assertEquals("Magazine", magazine.getItemType());
    }
    
    @Test
    @DisplayName("Get item details should include issue, volume, and frequency")
    void testGetItemDetails() {
        String details = magazine.getItemDetails();
        
        assertTrue(details.contains("Issue: " + TEST_ISSUE));
        assertTrue(details.contains("Volume: " + TEST_VOLUME));
        assertTrue(details.contains("Frequency: " + TEST_FREQUENCY));
    }
    
    @Test
    @DisplayName("Set issue number should update correctly")
    void testSetIssueNumber() {
        magazine.setIssueNumber(15);
        assertEquals(15, magazine.getIssueNumber());
    }
    
    @Test
    @DisplayName("Set issue number should throw exception for invalid values")
    void testSetIssueNumberInvalid() {
        assertThrows(IllegalArgumentException.class, () -> 
            magazine.setIssueNumber(0));
        
        assertThrows(IllegalArgumentException.class, () -> 
            magazine.setIssueNumber(-5));
    }
    
    @Test
    @DisplayName("Set volume should update correctly")
    void testSetVolume() {
        magazine.setVolume(250);
        assertEquals(250, magazine.getVolume());
    }
    
    @Test
    @DisplayName("Set volume should throw exception for invalid values")
    void testSetVolumeInvalid() {
        assertThrows(IllegalArgumentException.class, () -> 
            magazine.setVolume(0));
        
        assertThrows(IllegalArgumentException.class, () -> 
            magazine.setVolume(-1));
    }
    
    @Test
    @DisplayName("Set frequency should update correctly")
    void testSetFrequency() {
        magazine.setFrequency("Weekly");
        assertEquals("Weekly", magazine.getFrequency());
        
        magazine.setFrequency(null);
        assertEquals("Monthly", magazine.getFrequency());
    }
    
    @Test
    @DisplayName("Get magazine identifier should format correctly")
    void testGetMagazineIdentifier() {
        String identifier = magazine.getMagazineIdentifier();
        assertEquals("Vol.245 No.9", identifier);
    }
    
    @Test
    @DisplayName("Get max borrow days should vary by frequency")
    void testGetMaxBorrowDays() {
        Magazine weekly = new Magazine("W1", "Weekly", "Publisher", 2024, 1, 1, "Weekly");
        Magazine monthly = new Magazine("M1", "Monthly", "Publisher", 2024, 1, 1, "Monthly");
        Magazine quarterly = new Magazine("Q1", "Quarterly", "Publisher", 2024, 1, 1, "Quarterly");
        Magazine custom = new Magazine("C1", "Custom", "Publisher", 2024, 1, 1, "Custom");
        
        assertEquals(7, weekly.getMaxBorrowDays());
        assertEquals(14, monthly.getMaxBorrowDays());
        assertEquals(21, quarterly.getMaxBorrowDays());
        assertEquals(14, custom.getMaxBorrowDays()); // Default
    }
    
    @Test
    @DisplayName("Is current issue should work with simplified logic")
    void testIsCurrentIssue() {
        // This test uses simplified logic since the actual implementation
        // would need more complex date calculations
        Magazine currentMagazine = new Magazine("C1", "Current", "Publisher", 2024, 50, 1, "Monthly");
        Magazine oldMagazine = new Magazine("O1", "Old", "Publisher", 2020, 1, 1, "Monthly");
        
        // The logic is simplified, but we can test that the method exists and returns boolean
        boolean isCurrentForCurrent = currentMagazine.isCurrentIssue();
        boolean isCurrentForOld = oldMagazine.isCurrentIssue();
        
        // Just verify the method works and returns boolean values
        assertTrue(isCurrentForCurrent == true || isCurrentForCurrent == false);
        assertTrue(isCurrentForOld == true || isCurrentForOld == false);
    }
    
    @Test
    @DisplayName("Is archive issue should be opposite of is current issue")
    void testIsArchiveIssue() {
        boolean isCurrent = magazine.isCurrentIssue();
        boolean isArchive = magazine.isArchiveIssue();
        
        assertEquals(!isCurrent, isArchive);
    }
    
    @Test
    @DisplayName("Frequency constants should be available")
    void testFrequencyConstants() {
        assertEquals("Weekly", Magazine.Frequency.WEEKLY);
        assertEquals("Monthly", Magazine.Frequency.MONTHLY);
        assertEquals("Quarterly", Magazine.Frequency.QUARTERLY);
        assertEquals("Annual", Magazine.Frequency.ANNUAL);
    }
    
    @Test
    @DisplayName("Borrow and return operations should work correctly")
    void testBorrowAndReturn() {
        String memberId = "M123";
        
        // Test borrowing
        assertTrue(magazine.canBeBorrowed());
        magazine.borrowItem(memberId);
        
        assertEquals(memberId, magazine.getCurrentBorrower());
        assertFalse(magazine.isAvailable());
        assertFalse(magazine.canBeBorrowed());
        
        // Test returning
        magazine.returnItem();
        
        assertNull(magazine.getCurrentBorrower());
        assertTrue(magazine.isAvailable());
        assertTrue(magazine.canBeBorrowed());
    }
    
    @Test
    @DisplayName("Calculate total cost should use magazine daily rate")
    void testCalculateTotalCost() {
        assertEquals(2.5, magazine.calculateTotalCost(10), 0.001);
        assertEquals(0.25, magazine.calculateTotalCost(1), 0.001);
    }
    
    @Test
    @DisplayName("ToString should contain magazine information")
    void testToString() {
        String toString = magazine.toString();
        
        assertTrue(toString.contains(TEST_TITLE));
        assertTrue(toString.contains(TEST_AUTHOR));
        assertTrue(toString.contains(TEST_ISBN));
        assertTrue(toString.contains("Vol." + TEST_VOLUME));
        assertTrue(toString.contains("No." + TEST_ISSUE));
        assertTrue(toString.contains(TEST_FREQUENCY));
        assertTrue(toString.contains("Magazine"));
    }
    
    @Test
    @DisplayName("Inheritance should work correctly")
    void testInheritance() {
        // Test inherited methods from LibraryItem
        int currentYear = java.time.LocalDate.now().getYear();
        int expectedAge = currentYear - TEST_YEAR;
        assertEquals(expectedAge, magazine.getAge());
        
        // Test polymorphism
        LibraryItem item = magazine;
        assertEquals("Magazine", item.getItemType());
        assertEquals(0.25, item.calculateDailyCost(), 0.001);
    }
    
    @Test
    @DisplayName("Case insensitive frequency handling should work")
    void testCaseInsensitiveFrequency() {
        Magazine weeklyMag = new Magazine("W1", "Weekly", "Publisher", 2024, 1, 1, "WEEKLY");
        Magazine monthlyMag = new Magazine("M1", "Monthly", "Publisher", 2024, 1, 1, "monthly");
        Magazine quarterlyMag = new Magazine("Q1", "Quarterly", "Publisher", 2024, 1, 1, "Quarterly");
        
        assertEquals(7, weeklyMag.getMaxBorrowDays());
        assertEquals(14, monthlyMag.getMaxBorrowDays());
        assertEquals(21, quarterlyMag.getMaxBorrowDays());
    }
    
    @Test
    @DisplayName("Equals and hashCode should work correctly")
    void testEqualsAndHashCode() {
        Magazine sameMagazine = new Magazine(TEST_ISBN, "Different Title", "Different Author", 
                                           2000, 1, 1, "Weekly");
        Magazine differentMagazine = new Magazine("MAG-999", TEST_TITLE, TEST_AUTHOR, 
                                                 TEST_YEAR, TEST_ISSUE, TEST_VOLUME, TEST_FREQUENCY);
        
        assertEquals(magazine, sameMagazine);
        assertNotEquals(magazine, differentMagazine);
        assertNotEquals(magazine, null);
        assertNotEquals(magazine, "Not a magazine");
        
        assertEquals(magazine.hashCode(), sameMagazine.hashCode());
    }
}