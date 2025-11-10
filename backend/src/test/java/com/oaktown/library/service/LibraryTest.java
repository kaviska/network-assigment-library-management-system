package com.oaktown.library.service;

import com.oaktown.library.dao.BorrowingDAO;
import com.oaktown.library.dao.LibraryItemDAO;
import com.oaktown.library.dao.MemberDAO;
import com.oaktown.library.model.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * JUnit tests for the Library service class.
 * Uses Mockito for mocking DAO dependencies.
 */
@DisplayName("Library Service Tests")
class LibraryTest {
    
    @Mock
    private LibraryItemDAO mockItemDAO;
    
    @Mock
    private MemberDAO mockMemberDAO;
    
    @Mock
    private BorrowingDAO mockBorrowingDAO;
    
    private Library library;
    private Member testMember;
    private Book testBook;
    private Magazine testMagazine;
    private ReferenceBook testReferenceBook;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        library = new Library(mockItemDAO, mockMemberDAO, mockBorrowingDAO);
        
        // Create test objects
        testMember = new Member("M123", "John Doe", "john@email.com", "555-0123", "123 Main St");
        testBook = new Book("978-0060935467", "To Kill a Mockingbird", "Harper Lee", 1960, 281, "Fiction");
        testMagazine = new Magazine("MAG-001", "National Geographic", "Nat Geo", 2024, 9, 245, "Monthly");
        testReferenceBook = new ReferenceBook("REF-001", "Encyclopedia", "Publisher", 2020, 1000, true);
    }
    
    @Test
    @DisplayName("List all items should return all items from DAO")
    void testListAllItems() {
        List<LibraryItem> expectedItems = Arrays.asList(testBook, testMagazine);
        when(mockItemDAO.findAll()).thenReturn(expectedItems);
        
        List<LibraryItem> result = library.listAllItems();
        
        assertEquals(expectedItems, result);
        verify(mockItemDAO).findAll();
    }
    
    @Test
    @DisplayName("Search available items should delegate to DAO with keyword")
    void testSearchAvailableItems() {
        String keyword = "Mockingbird";
        List<LibraryItem> expectedItems = Arrays.asList(testBook);
        when(mockItemDAO.findAvailableByTitleKeyword(keyword)).thenReturn(expectedItems);
        
        List<LibraryItem> result = library.searchAvailableItems(keyword);
        
        assertEquals(expectedItems, result);
        verify(mockItemDAO).findAvailableByTitleKeyword(keyword);
    }
    
    @Test
    @DisplayName("Search available items should throw exception for null keyword")
    void testSearchAvailableItemsNullKeyword() {
        assertThrows(IllegalArgumentException.class, () -> 
            library.searchAvailableItems(null));
        
        assertThrows(IllegalArgumentException.class, () -> 
            library.searchAvailableItems("   "));
    }
    
    @Test
    @DisplayName("Borrow item should succeed with valid parameters")
    void testBorrowItemSuccess() {
        String isbn = testBook.getIsbn();
        
        // Setup mocks
        when(mockMemberDAO.findById(testMember.getMemberId())).thenReturn(testMember);
        when(mockItemDAO.findByIsbn(isbn)).thenReturn(testBook);
        when(mockBorrowingDAO.borrowItem(isbn, testMember.getMemberId(), 14, 0.50)).thenReturn(true);
        
        boolean result = library.borrowItem(isbn, testMember);
        
        assertTrue(result);
        verify(mockMemberDAO).findById(testMember.getMemberId());
        verify(mockItemDAO).findByIsbn(isbn);
        verify(mockBorrowingDAO).borrowItem(isbn, testMember.getMemberId(), 14, 0.50);
    }
    
    @Test
    @DisplayName("Borrow item should throw exception for null parameters")
    void testBorrowItemNullParameters() {
        assertThrows(IllegalArgumentException.class, () -> 
            library.borrowItem(null, testMember));
        
        assertThrows(IllegalArgumentException.class, () -> 
            library.borrowItem(testBook.getIsbn(), null));
        
        assertThrows(IllegalArgumentException.class, () -> 
            library.borrowItem("", testMember));
    }
    
    @Test
    @DisplayName("Borrow item should throw exception for non-existent member")
    void testBorrowItemNonExistentMember() {
        when(mockMemberDAO.findById(testMember.getMemberId())).thenReturn(null);
        
        assertThrows(IllegalArgumentException.class, () -> 
            library.borrowItem(testBook.getIsbn(), testMember));
    }
    
    @Test
    @DisplayName("Borrow item should throw exception for non-existent item")
    void testBorrowItemNonExistentItem() {
        when(mockMemberDAO.findById(testMember.getMemberId())).thenReturn(testMember);
        when(mockItemDAO.findByIsbn(testBook.getIsbn())).thenReturn(null);
        
        assertThrows(IllegalArgumentException.class, () -> 
            library.borrowItem(testBook.getIsbn(), testMember));
    }
    
    @Test
    @DisplayName("Borrow item should throw exception for inactive member")
    void testBorrowItemInactiveMember() {
        Member inactiveMember = new Member("M999", "Inactive", "inactive@email.com", "555-9999", "999 Street");
        inactiveMember.setActive(false);
        
        when(mockMemberDAO.findById(inactiveMember.getMemberId())).thenReturn(inactiveMember);
        
        assertThrows(IllegalStateException.class, () -> 
            library.borrowItem(testBook.getIsbn(), inactiveMember));
    }
    
    @Test
    @DisplayName("Borrow item should throw exception for restricted reference book")
    void testBorrowItemRestrictedReferenceBook() {
        when(mockMemberDAO.findById(testMember.getMemberId())).thenReturn(testMember);
        when(mockItemDAO.findByIsbn(testReferenceBook.getIsbn())).thenReturn(testReferenceBook);
        
        assertThrows(IllegalStateException.class, () -> 
            library.borrowItem(testReferenceBook.getIsbn(), testMember));
    }
    
    @Test
    @DisplayName("Return item should succeed with valid parameters")
    void testReturnItemSuccess() {
        String isbn = testBook.getIsbn();
        testMember.borrowItem(isbn); // Simulate borrowed item
        
        when(mockMemberDAO.findById(testMember.getMemberId())).thenReturn(testMember);
        when(mockItemDAO.findByIsbn(isbn)).thenReturn(testBook);
        when(mockBorrowingDAO.returnItem(isbn, testMember.getMemberId())).thenReturn(true);
        
        boolean result = library.returnItem(isbn, testMember);
        
        assertTrue(result);
        verify(mockBorrowingDAO).returnItem(isbn, testMember.getMemberId());
    }
    
    @Test
    @DisplayName("Return item should throw exception for null parameters")
    void testReturnItemNullParameters() {
        assertThrows(IllegalArgumentException.class, () -> 
            library.returnItem(null, testMember));
        
        assertThrows(IllegalArgumentException.class, () -> 
            library.returnItem(testBook.getIsbn(), null));
    }
    
    @Test
    @DisplayName("Calculate borrowing cost should return correct amount")
    void testCalculateBorrowingCost() {
        String isbn = testBook.getIsbn();
        int days = 10;
        
        when(mockItemDAO.findByIsbn(isbn)).thenReturn(testBook);
        
        double result = library.calculateBorrowingCost(isbn, days);
        
        assertEquals(5.0, result, 0.001); // 0.50 * 10 days
        verify(mockItemDAO).findByIsbn(isbn);
    }
    
    @Test
    @DisplayName("Calculate borrowing cost should throw exception for invalid parameters")
    void testCalculateBorrowingCostInvalidParameters() {
        assertThrows(IllegalArgumentException.class, () -> 
            library.calculateBorrowingCost(null, 10));
        
        assertThrows(IllegalArgumentException.class, () -> 
            library.calculateBorrowingCost(testBook.getIsbn(), 0));
        
        assertThrows(IllegalArgumentException.class, () -> 
            library.calculateBorrowingCost(testBook.getIsbn(), -5));
    }
    
    @Test
    @DisplayName("Get currently borrowed items should delegate to DAO")
    void testGetCurrentlyBorrowedItems() {
        List<Map<String, Object>> expectedItems = Arrays.asList(
            Map.of("isbn", "123", "title", "Book1"),
            Map.of("isbn", "456", "title", "Book2")
        );
        
        when(mockBorrowingDAO.getCurrentlyBorrowedItems(testMember.getMemberId()))
            .thenReturn(expectedItems);
        
        List<Map<String, Object>> result = library.getCurrentlyBorrowedItems(testMember);
        
        assertEquals(expectedItems, result);
        verify(mockBorrowingDAO).getCurrentlyBorrowedItems(testMember.getMemberId());
    }
    
    @Test
    @DisplayName("Get previously borrowed items should delegate to DAO")
    void testGetPreviouslyBorrowedItems() {
        List<Map<String, Object>> expectedItems = Arrays.asList(
            Map.of("isbn", "789", "title", "Book3"),
            Map.of("isbn", "000", "title", "Book4")
        );
        
        when(mockBorrowingDAO.getBorrowingHistory(testMember.getMemberId()))
            .thenReturn(expectedItems);
        
        List<Map<String, Object>> result = library.getPreviouslyBorrowedItems(testMember);
        
        assertEquals(expectedItems, result);
        verify(mockBorrowingDAO).getBorrowingHistory(testMember.getMemberId());
    }
    
    @Test
    @DisplayName("Add library item should succeed for new item")
    void testAddLibraryItemSuccess() {
        when(mockItemDAO.findByIsbn(testBook.getIsbn())).thenReturn(null);
        when(mockItemDAO.createLibraryItem(testBook)).thenReturn(true);
        
        boolean result = library.addLibraryItem(testBook);
        
        assertTrue(result);
        verify(mockItemDAO).findByIsbn(testBook.getIsbn());
        verify(mockItemDAO).createLibraryItem(testBook);
    }
    
    @Test
    @DisplayName("Add library item should throw exception for existing item")
    void testAddLibraryItemExisting() {
        when(mockItemDAO.findByIsbn(testBook.getIsbn())).thenReturn(testBook);
        
        assertThrows(IllegalArgumentException.class, () -> 
            library.addLibraryItem(testBook));
    }
    
    @Test
    @DisplayName("Add member should succeed for new member")
    void testAddMemberSuccess() {
        when(mockMemberDAO.memberExists(testMember.getMemberId())).thenReturn(false);
        when(mockMemberDAO.createMember(testMember)).thenReturn(true);
        
        boolean result = library.addMember(testMember);
        
        assertTrue(result);
        verify(mockMemberDAO).memberExists(testMember.getMemberId());
        verify(mockMemberDAO).createMember(testMember);
    }
    
    @Test
    @DisplayName("Add member should throw exception for existing member")
    void testAddMemberExisting() {
        when(mockMemberDAO.memberExists(testMember.getMemberId())).thenReturn(true);
        
        assertThrows(IllegalArgumentException.class, () -> 
            library.addMember(testMember));
    }
    
    @Test
    @DisplayName("Find member by ID should delegate to DAO")
    void testFindMemberById() {
        when(mockMemberDAO.findById(testMember.getMemberId())).thenReturn(testMember);
        
        Member result = library.findMemberById(testMember.getMemberId());
        
        assertEquals(testMember, result);
        verify(mockMemberDAO).findById(testMember.getMemberId());
    }
    
    @Test
    @DisplayName("Find item by ISBN should delegate to DAO")
    void testFindItemByIsbn() {
        when(mockItemDAO.findByIsbn(testBook.getIsbn())).thenReturn(testBook);
        
        LibraryItem result = library.findItemByIsbn(testBook.getIsbn());
        
        assertEquals(testBook, result);
        verify(mockItemDAO).findByIsbn(testBook.getIsbn());
    }
    
    @Test
    @DisplayName("Get all members should delegate to DAO")
    void testGetAllMembers() {
        List<Member> expectedMembers = Arrays.asList(testMember);
        when(mockMemberDAO.findAll()).thenReturn(expectedMembers);
        
        List<Member> result = library.getAllMembers();
        
        assertEquals(expectedMembers, result);
        verify(mockMemberDAO).findAll();
    }
    
    @Test
    @DisplayName("Search members by name should delegate to DAO")
    void testSearchMembersByName() {
        String namePattern = "John";
        List<Member> expectedMembers = Arrays.asList(testMember);
        when(mockMemberDAO.findByName(namePattern)).thenReturn(expectedMembers);
        
        List<Member> result = library.searchMembersByName(namePattern);
        
        assertEquals(expectedMembers, result);
        verify(mockMemberDAO).findByName(namePattern);
    }
    
    @Test
    @DisplayName("Remove library item should succeed for available item")
    void testRemoveLibraryItemSuccess() {
        when(mockItemDAO.findByIsbn(testBook.getIsbn())).thenReturn(testBook);
        when(mockItemDAO.deleteLibraryItem(testBook.getIsbn())).thenReturn(true);
        
        boolean result = library.removeLibraryItem(testBook.getIsbn());
        
        assertTrue(result);
        verify(mockItemDAO).findByIsbn(testBook.getIsbn());
        verify(mockItemDAO).deleteLibraryItem(testBook.getIsbn());
    }
    
    @Test
    @DisplayName("Remove library item should throw exception for borrowed item")
    void testRemoveLibraryItemBorrowed() {
        testBook.borrowItem("M123"); // Make item borrowed
        when(mockItemDAO.findByIsbn(testBook.getIsbn())).thenReturn(testBook);
        
        assertThrows(IllegalStateException.class, () -> 
            library.removeLibraryItem(testBook.getIsbn()));
    }
    
    @Test
    @DisplayName("Get library statistics should return correct counts")
    void testGetLibraryStatistics() {
        List<LibraryItem> allItems = Arrays.asList(testBook, testMagazine, testReferenceBook);
        List<Member> allMembers = Arrays.asList(testMember);
        
        when(mockItemDAO.findAll()).thenReturn(allItems);
        when(mockMemberDAO.findAll()).thenReturn(allMembers);
        
        Map<String, Integer> stats = library.getLibraryStatistics();
        
        assertEquals(3, stats.get("totalItems"));
        assertEquals(3, stats.get("availableItems"));
        assertEquals(0, stats.get("borrowedItems"));
        assertEquals(1, stats.get("books"));
        assertEquals(1, stats.get("referenceBooks"));
        assertEquals(1, stats.get("magazines"));
        assertEquals(1, stats.get("totalMembers"));
        assertEquals(1, stats.get("activeMembers"));
    }
    
    @Test
    @DisplayName("All methods should throw exception for null parameters where required")
    void testNullParameterValidation() {
        assertThrows(IllegalArgumentException.class, () -> library.addLibraryItem(null));
        assertThrows(IllegalArgumentException.class, () -> library.addMember(null));
        assertThrows(IllegalArgumentException.class, () -> library.getCurrentlyBorrowedItems(null));
        assertThrows(IllegalArgumentException.class, () -> library.getPreviouslyBorrowedItems(null));
        assertThrows(IllegalArgumentException.class, () -> library.findMemberById(null));
        assertThrows(IllegalArgumentException.class, () -> library.findItemByIsbn(null));
        assertThrows(IllegalArgumentException.class, () -> library.searchMembersByName(null));
        assertThrows(IllegalArgumentException.class, () -> library.removeLibraryItem(null));
        assertThrows(IllegalArgumentException.class, () -> library.updateMember(null));
    }
}