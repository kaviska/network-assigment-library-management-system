package com.oaktown.library;

import com.oaktown.library.model.*;
import com.oaktown.library.service.Library;
import com.oaktown.library.util.DatabaseConnection;

import java.util.List;
import java.util.Map;
import java.util.Scanner;

/**
 * Main application class for the OakTown Library Management System.
 * Provides a console-based user interface for library operations.
 */
public class App {
    
    private final Library library;
    private final Scanner scanner;
    
    public App() {
        this.library = new Library();
        this.scanner = new Scanner(System.in);
    }
    
    public static void main(String[] args) {
        System.out.println("=== OakTown Library Management System ===");
        System.out.println("Initializing...");
        
        // Test database connection
        DatabaseConnection dbConn = DatabaseConnection.getInstance();
        if (!dbConn.testConnection()) {
            System.err.println("Failed to connect to database. Please check your configuration.");
            System.err.println("Make sure MySQL is running and the database 'oaktown_library' exists.");
            return;
        }
        
        System.out.println("Database connection successful!");
        System.out.println();
        
        App app = new App();
        app.run();
    }
    
    /**
     * Main application loop
     */
    public void run() {
        boolean running = true;
        
        while (running) {
            try {
                displayMenu();
                int choice = getMenuChoice();
                
                switch (choice) {
                    case 1:
                        listAllLibraryItems();
                        break;
                    case 2:
                        searchAvailableItems();
                        break;
                    case 3:
                        borrowItem();
                        break;
                    case 4:
                        returnItem();
                        break;
                    case 5:
                        calculateBorrowingCost();
                        break;
                    case 6:
                        listMemberCurrentBorrowings();
                        break;
                    case 7:
                        listMemberBorrowingHistory();
                        break;
                    case 8:
                        running = false;
                        System.out.println("Thank you for using OakTown Library Management System!");
                        break;
                    default:
                        System.out.println("Invalid choice. Please try again.");
                }
                
                if (running) {
                    System.out.println("\nPress Enter to continue...");
                    scanner.nextLine();
                }
                
            } catch (Exception e) {
                System.err.println("An error occurred: " + e.getMessage());
                System.out.println("\nPress Enter to continue...");
                scanner.nextLine();
            }
        }
        
        scanner.close();
    }
    
    /**
     * Display the main menu
     */
    private void displayMenu() {
        System.out.println("\n" + "=".repeat(50));
        System.out.println("    OAKTOWN LIBRARY MANAGEMENT SYSTEM");
        System.out.println("=".repeat(50));
        System.out.println("1. List all library items");
        System.out.println("2. Search available items by keyword");
        System.out.println("3. Borrow an item");
        System.out.println("4. Return an item");
        System.out.println("5. Calculate borrowing cost");
        System.out.println("6. List member's current borrowings");
        System.out.println("7. List member's borrowing history");
        System.out.println("8. Exit");
        System.out.println("=".repeat(50));
        System.out.print("Enter your choice (1-8): ");
    }
    
    /**
     * Get menu choice from user
     */
    private int getMenuChoice() {
        try {
            String input = scanner.nextLine().trim();
            return Integer.parseInt(input);
        } catch (NumberFormatException e) {
            return -1;
        }
    }
    
    /**
     * List all library items regardless of availability
     */
    private void listAllLibraryItems() {
        System.out.println("\n--- ALL LIBRARY ITEMS ---");
        
        List<LibraryItem> items = library.listAllItems();
        
        if (items.isEmpty()) {
            System.out.println("No items found in the library.");
            return;
        }
        
        System.out.printf("%-20s %-40s %-25s %-6s %-15s %-12s%n", 
                "ISBN", "Title", "Author", "Year", "Type", "Status");
        System.out.println("-".repeat(120));
        
        for (LibraryItem item : items) {
            String status = item.isAvailable() ? "Available" : "Borrowed";
            System.out.printf("%-20s %-40s %-25s %-6d %-15s %-12s%n",
                    item.getIsbn(),
                    truncate(item.getTitle(), 38),
                    truncate(item.getAuthor(), 23),
                    item.getPublicationYear(),
                    item.getItemType(),
                    status);
        }
        
        System.out.println("\nTotal items: " + items.size());
    }
    
    /**
     * Search for available items by title keyword
     */
    private void searchAvailableItems() {
        System.out.println("\n--- SEARCH AVAILABLE ITEMS ---");
        System.out.print("Enter keyword to search in titles: ");
        
        String keyword = scanner.nextLine().trim();
        
        if (keyword.isEmpty()) {
            System.out.println("Keyword cannot be empty.");
            return;
        }
        
        List<LibraryItem> items = library.searchAvailableItems(keyword);
        
        if (items.isEmpty()) {
            System.out.println("No available items found matching keyword: " + keyword);
            return;
        }
        
        System.out.println("\nFound " + items.size() + " available item(s) matching '" + keyword + "':");
        System.out.printf("%-20s %-40s %-25s %-6s %-15s%n", 
                "ISBN", "Title", "Author", "Year", "Type");
        System.out.println("-".repeat(105));
        
        for (LibraryItem item : items) {
            System.out.printf("%-20s %-40s %-25s %-6d %-15s%n",
                    item.getIsbn(),
                    truncate(item.getTitle(), 38),
                    truncate(item.getAuthor(), 23),
                    item.getPublicationYear(),
                    item.getItemType());
        }
    }
    
    /**
     * Borrow an item
     */
    private void borrowItem() {
        System.out.println("\n--- BORROW ITEM ---");
        
        System.out.print("Enter ISBN: ");
        String isbn = scanner.nextLine().trim();
        
        System.out.print("Enter Member ID: ");
        String memberId = scanner.nextLine().trim();
        
        if (isbn.isEmpty() || memberId.isEmpty()) {
            System.out.println("ISBN and Member ID cannot be empty.");
            return;
        }
        
        try {
            // Find member
            Member member = library.findMemberById(memberId);
            if (member == null) {
                System.out.println("Member not found: " + memberId);
                return;
            }
            
            // Find item
            LibraryItem item = library.findItemByIsbn(isbn);
            if (item == null) {
                System.out.println("Item not found: " + isbn);
                return;
            }
            
            System.out.println("\nItem: " + item.getTitle() + " by " + item.getAuthor());
            System.out.println("Member: " + member.getName() + " (" + member.getMemberId() + ")");
            System.out.println("Daily cost: $" + String.format("%.2f", item.calculateDailyCost()));
            
            System.out.print("Enter number of days to borrow (default 14): ");
            String daysInput = scanner.nextLine().trim();
            int days = 14;
            
            if (!daysInput.isEmpty()) {
                try {
                    days = Integer.parseInt(daysInput);
                    if (days <= 0) {
                        System.out.println("Number of days must be positive. Using default 14 days.");
                        days = 14;
                    }
                } catch (NumberFormatException e) {
                    System.out.println("Invalid number format. Using default 14 days.");
                    days = 14;
                }
            }
            
            double totalCost = library.calculateBorrowingCost(isbn, days);
            System.out.println("Total cost for " + days + " days: $" + String.format("%.2f", totalCost));
            
            System.out.print("Confirm borrowing? (y/N): ");
            String confirm = scanner.nextLine().trim().toLowerCase();
            
            if (confirm.equals("y") || confirm.equals("yes")) {
                boolean success = library.borrowItem(isbn, member, days);
                
                if (success) {
                    System.out.println("✓ Item successfully borrowed!");
                    System.out.println("Due in " + days + " days.");
                } else {
                    System.out.println("✗ Failed to borrow item. Please check item availability and member status.");
                }
            } else {
                System.out.println("Borrowing cancelled.");
            }
            
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
    
    /**
     * Return an item
     */
    private void returnItem() {
        System.out.println("\n--- RETURN ITEM ---");
        
        System.out.print("Enter ISBN: ");
        String isbn = scanner.nextLine().trim();
        
        System.out.print("Enter Member ID: ");
        String memberId = scanner.nextLine().trim();
        
        if (isbn.isEmpty() || memberId.isEmpty()) {
            System.out.println("ISBN and Member ID cannot be empty.");
            return;
        }
        
        try {
            // Find member
            Member member = library.findMemberById(memberId);
            if (member == null) {
                System.out.println("Member not found: " + memberId);
                return;
            }
            
            // Find item
            LibraryItem item = library.findItemByIsbn(isbn);
            if (item == null) {
                System.out.println("Item not found: " + isbn);
                return;
            }
            
            System.out.println("\nItem: " + item.getTitle() + " by " + item.getAuthor());
            System.out.println("Member: " + member.getName() + " (" + member.getMemberId() + ")");
            
            System.out.print("Confirm return? (y/N): ");
            String confirm = scanner.nextLine().trim().toLowerCase();
            
            if (confirm.equals("y") || confirm.equals("yes")) {
                boolean success = library.returnItem(isbn, member);
                
                if (success) {
                    System.out.println("✓ Item successfully returned!");
                } else {
                    System.out.println("✗ Failed to return item. Please check if the member has borrowed this item.");
                }
            } else {
                System.out.println("Return cancelled.");
            }
            
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
    
    /**
     * Calculate borrowing cost
     */
    private void calculateBorrowingCost() {
        System.out.println("\n--- CALCULATE BORROWING COST ---");
        
        System.out.print("Enter ISBN: ");
        String isbn = scanner.nextLine().trim();
        
        System.out.print("Enter number of days: ");
        String daysInput = scanner.nextLine().trim();
        
        if (isbn.isEmpty() || daysInput.isEmpty()) {
            System.out.println("ISBN and number of days cannot be empty.");
            return;
        }
        
        try {
            int days = Integer.parseInt(daysInput);
            
            if (days <= 0) {
                System.out.println("Number of days must be positive.");
                return;
            }
            
            // Find item to display details
            LibraryItem item = library.findItemByIsbn(isbn);
            if (item == null) {
                System.out.println("Item not found: " + isbn);
                return;
            }
            
            double totalCost = library.calculateBorrowingCost(isbn, days);
            
            System.out.println("\nItem: " + item.getTitle() + " by " + item.getAuthor());
            System.out.println("Type: " + item.getItemType());
            System.out.println("Daily cost: $" + String.format("%.2f", item.calculateDailyCost()));
            System.out.println("Number of days: " + days);
            System.out.println("Total cost: $" + String.format("%.2f", totalCost));
            
        } catch (NumberFormatException e) {
            System.out.println("Invalid number format for days.");
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
    
    /**
     * List member's current borrowings
     */
    private void listMemberCurrentBorrowings() {
        System.out.println("\n--- MEMBER'S CURRENT BORROWINGS ---");
        
        System.out.print("Enter Member ID: ");
        String memberId = scanner.nextLine().trim();
        
        if (memberId.isEmpty()) {
            System.out.println("Member ID cannot be empty.");
            return;
        }
        
        try {
            Member member = library.findMemberById(memberId);
            if (member == null) {
                System.out.println("Member not found: " + memberId);
                return;
            }
            
            System.out.println("Member: " + member.getName() + " (" + member.getMemberId() + ")");
            
            List<Map<String, Object>> borrowings = library.getCurrentlyBorrowedItems(member);
            
            if (borrowings.isEmpty()) {
                System.out.println("No items currently borrowed.");
                return;
            }
            
            System.out.printf("%n%-20s %-40s %-25s %-12s %-12s %-10s%n", 
                    "ISBN", "Title", "Author", "Borrow Date", "Due Date", "Daily Cost");
            System.out.println("-".repeat(120));
            
            for (Map<String, Object> borrowing : borrowings) {
                System.out.printf("%-20s %-40s %-25s %-12s %-12s $%-9.2f%n",
                        borrowing.get("isbn"),
                        truncate((String) borrowing.get("title"), 38),
                        truncate((String) borrowing.get("author"), 23),
                        borrowing.get("borrowDate"),
                        borrowing.get("dueDate"),
                        borrowing.get("dailyCost"));
            }
            
            System.out.println("\nTotal items borrowed: " + borrowings.size());
            
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
    
    /**
     * List member's borrowing history
     */
    private void listMemberBorrowingHistory() {
        System.out.println("\n--- MEMBER'S BORROWING HISTORY ---");
        
        System.out.print("Enter Member ID: ");
        String memberId = scanner.nextLine().trim();
        
        if (memberId.isEmpty()) {
            System.out.println("Member ID cannot be empty.");
            return;
        }
        
        try {
            Member member = library.findMemberById(memberId);
            if (member == null) {
                System.out.println("Member not found: " + memberId);
                return;
            }
            
            System.out.println("Member: " + member.getName() + " (" + member.getMemberId() + ")");
            
            List<Map<String, Object>> history = library.getPreviouslyBorrowedItems(member);
            
            if (history.isEmpty()) {
                System.out.println("No borrowing history found.");
                return;
            }
            
            System.out.printf("%n%-20s %-35s %-20s %-12s %-12s %-10s%n", 
                    "ISBN", "Title", "Author", "Borrow Date", "Return Date", "Total Cost");
            System.out.println("-".repeat(115));
            
            double totalSpent = 0.0;
            
            for (Map<String, Object> borrowing : history) {
                double cost = (Double) borrowing.get("totalCost");
                totalSpent += cost;
                
                System.out.printf("%-20s %-35s %-20s %-12s %-12s $%-9.2f%n",
                        borrowing.get("isbn"),
                        truncate((String) borrowing.get("title"), 33),
                        truncate((String) borrowing.get("author"), 18),
                        borrowing.get("borrowDate"),
                        borrowing.get("returnDate"),
                        cost);
            }
            
            System.out.println("-".repeat(115));
            System.out.println("Total items returned: " + history.size());
            System.out.println("Total amount spent: $" + String.format("%.2f", totalSpent));
            
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
    
    /**
     * Utility method to truncate strings for display
     */
    private String truncate(String str, int maxLength) {
        if (str == null) return "";
        if (str.length() <= maxLength) return str;
        return str.substring(0, maxLength - 3) + "...";
    }
}