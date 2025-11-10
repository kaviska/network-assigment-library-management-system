package com.oaktown.library.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

/**
 * JUnit tests for the ReferenceBook class.
 * Tests inheritance, method overriding, and reference-specific functionality.
 */
@DisplayName("Reference Book Class Tests")
class ReferenceBookTest {
    
    private ReferenceBook restrictedRefBook;
    private ReferenceBook unrestrictedRefBook;
    
    private static final String TEST_ISBN_1 = "978-0199571123";
    private static final String TEST_ISBN_2 = "978-0073383095";
    private static final String TEST_TITLE = "Oxford English Dictionary";
    private static final String TEST_AUTHOR = "Oxford University Press";
    private static final int TEST_YEAR = 2019;
    private static final int TEST_PAGES = 2000;
    
    @BeforeEach
    void setUp() {
        restrictedRefBook = new ReferenceBook(TEST_ISBN_1, TEST_TITLE, TEST_AUTHOR, TEST_YEAR, TEST_PAGES, true);
        unrestrictedRefBook = new ReferenceBook(TEST_ISBN_2, "Campbell Biology", "Jane Reece", 2017, 1488, false);
    }
    
    @Test
    @DisplayName("Constructor should create reference book with restriction status")
    void testConstructor() {
        assertEquals(TEST_ISBN_1, restrictedRefBook.getIsbn());
        assertEquals(TEST_TITLE, restrictedRefBook.getTitle());
        assertEquals(TEST_AUTHOR, restrictedRefBook.getAuthor());
        assertEquals(TEST_YEAR, restrictedRefBook.getPublicationYear());
        assertEquals(TEST_PAGES, restrictedRefBook.getPages());
        assertEquals("Reference", restrictedRefBook.getGenre());
        assertTrue(restrictedRefBook.isRestricted());
        
        assertFalse(unrestrictedRefBook.isRestricted());
    }
    
    @Test
    @DisplayName("Constructor with custom genre should preserve genre")
    void testConstructorWithCustomGenre() {
        ReferenceBook customGenreBook = new ReferenceBook(
            "123", "Math Book", "Author", 2020, 500, "Mathematics", true);
        assertEquals("Mathematics", customGenreBook.getGenre());
    }
    
    @Test
    @DisplayName("Calculate daily cost should return reference book rate")
    void testCalculateDailyCost() {
        assertEquals(1.00, restrictedRefBook.calculateDailyCost(), 0.001);
        assertEquals(1.00, unrestrictedRefBook.calculateDailyCost(), 0.001);
    }
    
    @Test
    @DisplayName("Get item type should return 'Reference Book'")
    void testGetItemType() {
        assertEquals("Reference Book", restrictedRefBook.getItemType());
    }
    
    @Test
    @DisplayName("Get item details should include restriction status")
    void testGetItemDetails() {
        String restrictedDetails = restrictedRefBook.getItemDetails();
        String unrestrictedDetails = unrestrictedRefBook.getItemDetails();
        
        assertTrue(restrictedDetails.contains("Restricted: Yes"));
        assertTrue(unrestrictedDetails.contains("Restricted: No"));
        assertTrue(restrictedDetails.contains("Pages: " + TEST_PAGES));
    }
    
    @Test
    @DisplayName("Is reference should return true")
    void testIsReference() {
        assertTrue(restrictedRefBook.isReference());
        assertTrue(unrestrictedRefBook.isReference());
    }
    
    @Test
    @DisplayName("Can be borrowed should respect restriction status")
    void testCanBeBorrowed() {
        // Restricted book cannot be borrowed
        assertFalse(restrictedRefBook.canBeBorrowed());
        
        // Unrestricted book can be borrowed
        assertTrue(unrestrictedRefBook.canBeBorrowed());
    }
    
    @Test
    @DisplayName("Borrow item should throw exception for restricted book")
    void testBorrowRestrictedItem() {
        assertThrows(IllegalStateException.class, () -> 
            restrictedRefBook.borrowItem("M123"));
    }
    
    @Test
    @DisplayName("Borrow item should work for unrestricted book")
    void testBorrowUnrestrictedItem() {
        String memberId = "M123";
        
        assertTrue(unrestrictedRefBook.canBeBorrowed());
        unrestrictedRefBook.borrowItem(memberId);
        
        assertEquals(memberId, unrestrictedRefBook.getCurrentBorrower());
        assertFalse(unrestrictedRefBook.isAvailable());
    }
    
    @Test
    @DisplayName("Set restricted should update restriction status")
    void testSetRestricted() {
        unrestrictedRefBook.setRestricted(true);
        assertTrue(unrestrictedRefBook.isRestricted());
        assertFalse(unrestrictedRefBook.canBeBorrowed());
        
        unrestrictedRefBook.setRestricted(false);
        assertFalse(unrestrictedRefBook.isRestricted());
        assertTrue(unrestrictedRefBook.canBeBorrowed());
    }
    
    @Test
    @DisplayName("Set restricted should throw exception if currently borrowed")
    void testSetRestrictedWhenBorrowed() {
        unrestrictedRefBook.borrowItem("M123");
        
        assertThrows(IllegalStateException.class, () -> 
            unrestrictedRefBook.setRestricted(true));
    }
    
    @Test
    @DisplayName("Get access level should return correct description")
    void testGetAccessLevel() {
        assertEquals("In-Library Use Only", restrictedRefBook.getAccessLevel());
        assertEquals("Borrowable", unrestrictedRefBook.getAccessLevel());
    }
    
    @Test
    @DisplayName("Is in library use only should match restriction status")
    void testIsInLibraryUseOnly() {
        assertTrue(restrictedRefBook.isInLibraryUseOnly());
        assertFalse(unrestrictedRefBook.isInLibraryUseOnly());
    }
    
    @Test
    @DisplayName("Requires special handling should work correctly")
    void testRequiresSpecialHandling() {
        // Restricted book requires special handling
        assertTrue(restrictedRefBook.requiresSpecialHandling());
        
        // Large unrestricted book requires special handling
        ReferenceBook largeBook = new ReferenceBook(
            "456", "Large Book", "Author", 2020, 1500, false);
        assertTrue(largeBook.requiresSpecialHandling());
        
        // Small unrestricted book does not require special handling
        ReferenceBook smallBook = new ReferenceBook(
            "789", "Small Book", "Author", 2020, 500, false);
        assertFalse(smallBook.requiresSpecialHandling());
    }
    
    @Test
    @DisplayName("ToString should include restriction information")
    void testToString() {
        String restrictedString = restrictedRefBook.toString();
        String unrestrictedString = unrestrictedRefBook.toString();
        
        assertTrue(restrictedString.contains("[RESTRICTED]"));
        assertTrue(unrestrictedString.contains("[BORROWABLE]"));
        assertTrue(restrictedString.contains("Reference Book"));
    }
    
    @Test
    @DisplayName("Inheritance should preserve book functionality")
    void testInheritance() {
        // Test inherited methods from Book
        assertTrue(restrictedRefBook.isLongBook()); // 2000 pages > 500
        assertEquals("Very Long", restrictedRefBook.getBookCategory());
        
        // Test inherited methods from LibraryItem
        int currentYear = java.time.LocalDate.now().getYear();
        int expectedAge = currentYear - TEST_YEAR;
        assertEquals(expectedAge, restrictedRefBook.getAge());
    }
    
    @Test
    @DisplayName("Calculate total cost should use reference book daily rate")
    void testCalculateTotalCost() {
        assertEquals(10.0, restrictedRefBook.calculateTotalCost(10), 0.001);
        assertEquals(1.0, unrestrictedRefBook.calculateTotalCost(1), 0.001);
    }
    
    @Test
    @DisplayName("Return item should work for borrowed unrestricted book")
    void testReturnItem() {
        unrestrictedRefBook.borrowItem("M123");
        assertFalse(unrestrictedRefBook.isAvailable());
        
        unrestrictedRefBook.returnItem();
        assertTrue(unrestrictedRefBook.isAvailable());
        assertNull(unrestrictedRefBook.getCurrentBorrower());
    }
    
    @Test
    @DisplayName("Polymorphism should work correctly")
    void testPolymorphism() {
        // Reference book should behave as LibraryItem
        LibraryItem item = restrictedRefBook;
        
        assertEquals("Reference Book", item.getItemType());
        assertEquals(1.00, item.calculateDailyCost(), 0.001);
        assertFalse(item.canBeBorrowed()); // Restricted
        
        // Reference book should behave as Book
        Book book = unrestrictedRefBook;
        assertTrue(book.isReference()); // Overridden method
        assertEquals("Reference", book.getGenre());
    }
}