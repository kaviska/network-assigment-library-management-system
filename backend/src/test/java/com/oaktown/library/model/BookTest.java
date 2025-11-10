package com.oaktown.library.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

/**
 * JUnit tests for the Book class.
 * Tests demonstrate proper OOP principles and edge cases.
 */
@DisplayName("Book Class Tests")
class BookTest {
    
    private Book book;
    private static final String TEST_ISBN = "978-0060935467";
    private static final String TEST_TITLE = "To Kill a Mockingbird";
    private static final String TEST_AUTHOR = "Harper Lee";
    private static final int TEST_YEAR = 1960;
    private static final int TEST_PAGES = 281;
    private static final String TEST_GENRE = "Fiction";
    
    @BeforeEach
    void setUp() {
        book = new Book(TEST_ISBN, TEST_TITLE, TEST_AUTHOR, TEST_YEAR, TEST_PAGES, TEST_GENRE);
    }
    
    @Test
    @DisplayName("Constructor with all parameters should create book correctly")
    void testConstructorWithAllParameters() {
        assertEquals(TEST_ISBN, book.getIsbn());
        assertEquals(TEST_TITLE, book.getTitle());
        assertEquals(TEST_AUTHOR, book.getAuthor());
        assertEquals(TEST_YEAR, book.getPublicationYear());
        assertEquals(TEST_PAGES, book.getPages());
        assertEquals(TEST_GENRE, book.getGenre());
        assertTrue(book.isAvailable());
        assertNull(book.getCurrentBorrower());
    }
    
    @Test
    @DisplayName("Constructor with default genre should set genre to 'General'")
    void testConstructorWithDefaultGenre() {
        Book defaultGenreBook = new Book(TEST_ISBN, TEST_TITLE, TEST_AUTHOR, TEST_YEAR, TEST_PAGES);
        assertEquals("General", defaultGenreBook.getGenre());
    }
    
    @Test
    @DisplayName("Constructor should throw exception for null ISBN")
    void testConstructorWithNullIsbn() {
        assertThrows(NullPointerException.class, () -> 
            new Book(null, TEST_TITLE, TEST_AUTHOR, TEST_YEAR, TEST_PAGES, TEST_GENRE));
    }
    
    @Test
    @DisplayName("Constructor should throw exception for null title")
    void testConstructorWithNullTitle() {
        assertThrows(NullPointerException.class, () -> 
            new Book(TEST_ISBN, null, TEST_AUTHOR, TEST_YEAR, TEST_PAGES, TEST_GENRE));
    }
    
    @Test
    @DisplayName("Constructor should throw exception for null author")
    void testConstructorWithNullAuthor() {
        assertThrows(NullPointerException.class, () -> 
            new Book(TEST_ISBN, TEST_TITLE, null, TEST_YEAR, TEST_PAGES, TEST_GENRE));
    }
    
    @Test
    @DisplayName("Constructor should throw exception for invalid pages")
    void testConstructorWithInvalidPages() {
        assertThrows(IllegalArgumentException.class, () -> 
            new Book(TEST_ISBN, TEST_TITLE, TEST_AUTHOR, TEST_YEAR, 0, TEST_GENRE));
        
        assertThrows(IllegalArgumentException.class, () -> 
            new Book(TEST_ISBN, TEST_TITLE, TEST_AUTHOR, TEST_YEAR, -5, TEST_GENRE));
    }
    
    @Test
    @DisplayName("Calculate daily cost should return correct value")
    void testCalculateDailyCost() {
        assertEquals(0.50, book.calculateDailyCost(), 0.001);
    }
    
    @Test
    @DisplayName("Get item type should return 'Book'")
    void testGetItemType() {
        assertEquals("Book", book.getItemType());
    }
    
    @Test
    @DisplayName("Get item details should include pages and genre")
    void testGetItemDetails() {
        String details = book.getItemDetails();
        assertTrue(details.contains("Pages: " + TEST_PAGES));
        assertTrue(details.contains("Genre: " + TEST_GENRE));
    }
    
    @Test
    @DisplayName("Is long book should work correctly")
    void testIsLongBook() {
        Book shortBook = new Book("123", "Short", "Author", 2020, 100);
        Book longBook = new Book("456", "Long", "Author", 2020, 600);
        
        assertFalse(shortBook.isLongBook());
        assertTrue(longBook.isLongBook());
    }
    
    @Test
    @DisplayName("Get book category should categorize correctly")
    void testGetBookCategory() {
        Book shortBook = new Book("123", "Short", "Author", 2020, 50);
        Book mediumBook = new Book("456", "Medium", "Author", 2020, 200);
        Book longBook = new Book("789", "Long", "Author", 2020, 400);
        Book veryLongBook = new Book("000", "Very Long", "Author", 2020, 600);
        
        assertEquals("Short", shortBook.getBookCategory());
        assertEquals("Medium", mediumBook.getBookCategory());
        assertEquals("Long", longBook.getBookCategory());
        assertEquals("Very Long", veryLongBook.getBookCategory());
    }
    
    @Test
    @DisplayName("Is reference should return false for regular book")
    void testIsReference() {
        assertFalse(book.isReference());
    }
    
    @Test
    @DisplayName("Set genre should update genre correctly")
    void testSetGenre() {
        book.setGenre("Science Fiction");
        assertEquals("Science Fiction", book.getGenre());
        
        book.setGenre(null);
        assertEquals("General", book.getGenre());
    }
    
    @Test
    @DisplayName("Borrow and return operations should work correctly")
    void testBorrowAndReturn() {
        String memberId = "M123";
        
        // Test borrowing
        assertTrue(book.canBeBorrowed());
        book.borrowItem(memberId);
        
        assertEquals(memberId, book.getCurrentBorrower());
        assertFalse(book.isAvailable());
        assertFalse(book.canBeBorrowed());
        
        // Test returning
        book.returnItem();
        
        assertNull(book.getCurrentBorrower());
        assertTrue(book.isAvailable());
        assertTrue(book.canBeBorrowed());
    }
    
    @Test
    @DisplayName("Borrow item should throw exception when already borrowed")
    void testBorrowAlreadyBorrowedItem() {
        book.borrowItem("M123");
        
        assertThrows(IllegalStateException.class, () -> 
            book.borrowItem("M456"));
    }
    
    @Test
    @DisplayName("Return item should throw exception when not borrowed")
    void testReturnNotBorrowedItem() {
        assertThrows(IllegalStateException.class, () -> 
            book.returnItem());
    }
    
    @Test
    @DisplayName("Calculate total cost should work correctly")
    void testCalculateTotalCost() {
        assertEquals(5.0, book.calculateTotalCost(10), 0.001);
        assertEquals(0.5, book.calculateTotalCost(1), 0.001);
    }
    
    @Test
    @DisplayName("Calculate total cost should throw exception for invalid days")
    void testCalculateTotalCostInvalidDays() {
        assertThrows(IllegalArgumentException.class, () -> 
            book.calculateTotalCost(0));
        
        assertThrows(IllegalArgumentException.class, () -> 
            book.calculateTotalCost(-5));
    }
    
    @Test
    @DisplayName("Equals and hashCode should work correctly")
    void testEqualsAndHashCode() {
        Book sameBook = new Book(TEST_ISBN, "Different Title", "Different Author", 2000, 100);
        Book differentBook = new Book("978-1234567890", TEST_TITLE, TEST_AUTHOR, TEST_YEAR, TEST_PAGES);
        
        assertEquals(book, sameBook);
        assertNotEquals(book, differentBook);
        assertNotEquals(book, null);
        assertNotEquals(book, "Not a book");
        
        assertEquals(book.hashCode(), sameBook.hashCode());
    }
    
    @Test
    @DisplayName("ToString should contain book information")
    void testToString() {
        String toString = book.toString();
        
        assertTrue(toString.contains(TEST_TITLE));
        assertTrue(toString.contains(TEST_AUTHOR));
        assertTrue(toString.contains(TEST_ISBN));
        assertTrue(toString.contains(String.valueOf(TEST_YEAR)));
        assertTrue(toString.contains("Book"));
        assertTrue(toString.contains("Available"));
    }
    
    @Test
    @DisplayName("Get age should calculate correctly")
    void testGetAge() {
        int currentYear = java.time.LocalDate.now().getYear();
        int expectedAge = currentYear - TEST_YEAR;
        assertEquals(expectedAge, book.getAge());
    }
}