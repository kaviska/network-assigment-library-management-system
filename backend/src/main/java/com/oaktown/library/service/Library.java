package com.oaktown.library.service;

import com.oaktown.library.dao.BorrowingDAO;
import com.oaktown.library.dao.LibraryItemDAO;
import com.oaktown.library.dao.MemberDAO;
import com.oaktown.library.model.*;

import java.util.List;
import java.util.Map;

/**
 * Library service class that provides high-level operations for the library system.
 * This class demonstrates the Facade pattern by providing a simple interface
 * to the complex subsystem of DAOs and models.
 */
public class Library {
    
    private final LibraryItemDAO itemDAO;
    private final MemberDAO memberDAO;
    private final BorrowingDAO borrowingDAO;
    
    // Constructor demonstrating dependency injection
    public Library() {
        this.itemDAO = new LibraryItemDAO();
        this.memberDAO = new MemberDAO();
        this.borrowingDAO = new BorrowingDAO();
    }
    
    // Constructor for testing with dependency injection
    public Library(LibraryItemDAO itemDAO, MemberDAO memberDAO, BorrowingDAO borrowingDAO) {
        this.itemDAO = itemDAO;
        this.memberDAO = memberDAO;
        this.borrowingDAO = borrowingDAO;
    }
    
    /**
     * List all library items regardless of availability
     */
    public List<LibraryItem> listAllItems() {
        return itemDAO.findAll();
    }
    
    /**
     * List all available items that match a keyword in the title
     */
    public List<LibraryItem> searchAvailableItems(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new IllegalArgumentException("Search keyword cannot be null or empty");
        }
        return itemDAO.findAvailableByTitleKeyword(keyword.trim());
    }
    
    /**
     * Borrow an item by specifying ISBN and member object
     */
    public boolean borrowItem(String isbn, Member member) {
        return borrowItem(isbn, member, 14); // Default 14 days
    }
    
    /**
     * Borrow an item with specified duration
     */
    public boolean borrowItem(String isbn, Member member, int days) {
        // Validation
        if (isbn == null || isbn.trim().isEmpty()) {
            throw new IllegalArgumentException("ISBN cannot be null or empty");
        }
        if (member == null) {
            throw new IllegalArgumentException("Member cannot be null");
        }
        if (days <= 0) {
            throw new IllegalArgumentException("Borrowing days must be positive");
        }
        
        // Check if member exists in database
        Member dbMember = memberDAO.findById(member.getMemberId());
        if (dbMember == null) {
            throw new IllegalArgumentException("Member not found in database");
        }
        
        if (!dbMember.isActive()) {
            throw new IllegalStateException("Member account is not active");
        }
        
        // Find the item
        LibraryItem item = itemDAO.findByIsbn(isbn);
        if (item == null) {
            throw new IllegalArgumentException("Item with ISBN " + isbn + " not found");
        }
        
        // Check if item can be borrowed
        if (!item.canBeBorrowed()) {
            throw new IllegalStateException("Item cannot be borrowed: " + 
                (item.isAvailable() ? "Item restrictions apply" : "Item is already borrowed"));
        }
        
        // Calculate daily cost
        double dailyCost = item.calculateDailyCost();
        
        // Perform the borrowing transaction
        boolean success = borrowingDAO.borrowItem(isbn, member.getMemberId(), days, dailyCost);
        
        if (success) {
            // Update member object (for consistency)
            try {
                member.borrowItem(isbn);
            } catch (Exception e) {
                // Member object might be out of sync, but database operation succeeded
                System.out.println("Note: Member object may be out of sync with database");
            }
        }
        
        return success;
    }
    
    /**
     * Return an item by specifying ISBN and member object
     */
    public boolean returnItem(String isbn, Member member) {
        // Validation
        if (isbn == null || isbn.trim().isEmpty()) {
            throw new IllegalArgumentException("ISBN cannot be null or empty");
        }
        if (member == null) {
            throw new IllegalArgumentException("Member cannot be null");
        }
        
        // Check if member exists in database
        Member dbMember = memberDAO.findById(member.getMemberId());
        if (dbMember == null) {
            throw new IllegalArgumentException("Member not found in database");
        }
        
        // Find the item
        LibraryItem item = itemDAO.findByIsbn(isbn);
        if (item == null) {
            throw new IllegalArgumentException("Item with ISBN " + isbn + " not found");
        }
        
        // Check if member has borrowed this item
        if (!member.hasBorrowedItem(isbn) && item.isAvailable()) {
            throw new IllegalStateException("Member has not borrowed this item");
        }
        
        // Perform the return transaction
        boolean success = borrowingDAO.returnItem(isbn, member.getMemberId());
        
        if (success) {
            // Update member object (for consistency)
            try {
                member.returnItem(isbn);
            } catch (Exception e) {
                // Member object might be out of sync, but database operation succeeded
                System.out.println("Note: Member object may be out of sync with database");
            }
        }
        
        return success;
    }
    
    /**
     * Calculate the borrowing cost for an item for specified number of days
     */
    public double calculateBorrowingCost(String isbn, int days) {
        if (isbn == null || isbn.trim().isEmpty()) {
            throw new IllegalArgumentException("ISBN cannot be null or empty");
        }
        if (days <= 0) {
            throw new IllegalArgumentException("Number of days must be positive");
        }
        
        LibraryItem item = itemDAO.findByIsbn(isbn);
        if (item == null) {
            throw new IllegalArgumentException("Item with ISBN " + isbn + " not found");
        }
        
        return item.calculateTotalCost(days);
    }
    
    /**
     * List all items the specified member is currently borrowing
     */
    public List<Map<String, Object>> getCurrentlyBorrowedItems(Member member) {
        if (member == null) {
            throw new IllegalArgumentException("Member cannot be null");
        }
        
        return borrowingDAO.getCurrentlyBorrowedItems(member.getMemberId());
    }
    
    /**
     * List all items the specified member has previously borrowed
     */
    public List<Map<String, Object>> getPreviouslyBorrowedItems(Member member) {
        if (member == null) {
            throw new IllegalArgumentException("Member cannot be null");
        }
        
        return borrowingDAO.getBorrowingHistory(member.getMemberId());
    }
    
    /**
     * Add a new library item
     */
    public boolean addLibraryItem(LibraryItem item) {
        if (item == null) {
            throw new IllegalArgumentException("Library item cannot be null");
        }
        
        // Check if item already exists
        LibraryItem existing = itemDAO.findByIsbn(item.getIsbn());
        if (existing != null) {
            throw new IllegalArgumentException("Item with ISBN " + item.getIsbn() + " already exists");
        }
        
        return itemDAO.createLibraryItem(item);
    }
    
    /**
     * Add a new member
     */
    public boolean addMember(Member member) {
        if (member == null) {
            throw new IllegalArgumentException("Member cannot be null");
        }
        
        // Check if member already exists
        if (memberDAO.memberExists(member.getMemberId())) {
            throw new IllegalArgumentException("Member with ID " + member.getMemberId() + " already exists");
        }
        
        return memberDAO.createMember(member);
    }
    
    /**
     * Find member by ID
     */
    public Member findMemberById(String memberId) {
        if (memberId == null || memberId.trim().isEmpty()) {
            throw new IllegalArgumentException("Member ID cannot be null or empty");
        }
        
        return memberDAO.findById(memberId);
    }
    
    /**
     * Find item by ISBN
     */
    public LibraryItem findItemByIsbn(String isbn) {
        if (isbn == null || isbn.trim().isEmpty()) {
            throw new IllegalArgumentException("ISBN cannot be null or empty");
        }
        
        return itemDAO.findByIsbn(isbn);
    }
    
    /**
     * Get all members
     */
    public List<Member> getAllMembers() {
        return memberDAO.findAll();
    }
    
    /**
     * Search members by name
     */
    public List<Member> searchMembersByName(String namePattern) {
        if (namePattern == null || namePattern.trim().isEmpty()) {
            throw new IllegalArgumentException("Name pattern cannot be null or empty");
        }
        
        return memberDAO.findByName(namePattern.trim());
    }
    
    /**
     * Get overdue items
     */
    public List<Map<String, Object>> getOverdueItems() {
        return borrowingDAO.getOverdueItems();
    }
    
    /**
     * Update member information
     */
    public boolean updateMember(Member member) {
        if (member == null) {
            throw new IllegalArgumentException("Member cannot be null");
        }
        
        return memberDAO.updateMember(member);
    }
    
    /**
     * Remove library item
     */
    public boolean removeLibraryItem(String isbn) {
        if (isbn == null || isbn.trim().isEmpty()) {
            throw new IllegalArgumentException("ISBN cannot be null or empty");
        }
        
        // Check if item is currently borrowed
        LibraryItem item = itemDAO.findByIsbn(isbn);
        if (item != null && !item.isAvailable()) {
            throw new IllegalStateException("Cannot remove item that is currently borrowed");
        }
        
        return itemDAO.deleteLibraryItem(isbn);
    }
    
    /**
     * Get library statistics
     */
    public Map<String, Integer> getLibraryStatistics() {
        List<LibraryItem> allItems = itemDAO.findAll();
        
        int totalItems = allItems.size();
        int availableItems = 0;
        int borrowedItems = 0;
        int books = 0;
        int referenceBooks = 0;
        int magazines = 0;
        
        for (LibraryItem item : allItems) {
            if (item.isAvailable()) {
                availableItems++;
            } else {
                borrowedItems++;
            }
            
            if (item instanceof ReferenceBook) {
                referenceBooks++;
            } else if (item instanceof Book) {
                books++;
            } else if (item instanceof Magazine) {
                magazines++;
            }
        }
        
        List<Member> allMembers = memberDAO.findAll();
        int totalMembers = allMembers.size();
        int activeMembers = (int) allMembers.stream().filter(Member::isActive).count();
        
        return Map.of(
            "totalItems", totalItems,
            "availableItems", availableItems,
            "borrowedItems", borrowedItems,
            "books", books,
            "referenceBooks", referenceBooks,
            "magazines", magazines,
            "totalMembers", totalMembers,
            "activeMembers", activeMembers
        );
    }
}