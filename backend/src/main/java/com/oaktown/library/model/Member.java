package com.oaktown.library.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Member class representing a library member.
 * Demonstrates encapsulation and composition.
 */
public class Member {
    
    private String memberId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private LocalDate registrationDate;
    private boolean active;
    
    // Composition - Member has collections of borrowed items
    private List<String> currentlyBorrowedItems; // ISBNs
    private List<String> previouslyBorrowedItems; // ISBNs
    
    // Constructor
    public Member(String memberId, String name) {
        this.memberId = Objects.requireNonNull(memberId, "Member ID cannot be null");
        this.name = Objects.requireNonNull(name, "Name cannot be null");
        this.registrationDate = LocalDate.now();
        this.active = true;
        this.currentlyBorrowedItems = new ArrayList<>();
        this.previouslyBorrowedItems = new ArrayList<>();
    }
    
    public Member(String memberId, String name, String email, String phone, String address) {
        this(memberId, name);
        this.email = email;
        this.phone = phone;
        this.address = address;
    }
    
    // Full constructor
    public Member(String memberId, String name, String email, String phone, String address, 
                 LocalDate registrationDate, boolean active) {
        this.memberId = Objects.requireNonNull(memberId, "Member ID cannot be null");
        this.name = Objects.requireNonNull(name, "Name cannot be null");
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.registrationDate = registrationDate != null ? registrationDate : LocalDate.now();
        this.active = active;
        this.currentlyBorrowedItems = new ArrayList<>();
        this.previouslyBorrowedItems = new ArrayList<>();
    }
    
    // Getters
    public String getMemberId() {
        return memberId;
    }
    
    public String getName() {
        return name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public String getAddress() {
        return address;
    }
    
    public LocalDate getRegistrationDate() {
        return registrationDate;
    }
    
    public boolean isActive() {
        return active;
    }
    
    // Return immutable copies to maintain encapsulation
    public List<String> getCurrentlyBorrowedItems() {
        return Collections.unmodifiableList(currentlyBorrowedItems);
    }
    
    public List<String> getPreviouslyBorrowedItems() {
        return Collections.unmodifiableList(previouslyBorrowedItems);
    }
    
    // Setters
    public void setName(String name) {
        this.name = Objects.requireNonNull(name, "Name cannot be null");
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    // Business logic methods
    public boolean canBorrowItems() {
        return active && getCurrentBorrowedCount() < getMaxBorrowLimit();
    }
    
    public int getCurrentBorrowedCount() {
        return currentlyBorrowedItems.size();
    }
    
    public int getTotalBorrowedCount() {
        return previouslyBorrowedItems.size() + currentlyBorrowedItems.size();
    }
    
    public int getMaxBorrowLimit() {
        // Business rule: regular members can borrow up to 5 items
        return 5;
    }
    
    public boolean hasBorrowedItem(String isbn) {
        return currentlyBorrowedItems.contains(isbn);
    }
    
    public boolean hasEverBorrowedItem(String isbn) {
        return currentlyBorrowedItems.contains(isbn) || previouslyBorrowedItems.contains(isbn);
    }
    
    // Item borrowing management
    public void borrowItem(String isbn) {
        if (!canBorrowItems()) {
            throw new IllegalStateException("Member cannot borrow more items");
        }
        if (hasBorrowedItem(isbn)) {
            throw new IllegalStateException("Member has already borrowed this item");
        }
        currentlyBorrowedItems.add(isbn);
    }
    
    public void returnItem(String isbn) {
        if (!hasBorrowedItem(isbn)) {
            throw new IllegalStateException("Member has not borrowed this item");
        }
        currentlyBorrowedItems.remove(isbn);
        if (!previouslyBorrowedItems.contains(isbn)) {
            previouslyBorrowedItems.add(isbn);
        }
    }
    
    // Utility methods
    public int getMembershipDuration() {
        return (int) java.time.temporal.ChronoUnit.DAYS.between(registrationDate, LocalDate.now());
    }
    
    public boolean isNewMember() {
        return getMembershipDuration() <= 30; // Less than 30 days
    }
    
    public String getMembershipLevel() {
        int totalBorrowed = getTotalBorrowedCount();
        if (totalBorrowed < 10) return "Bronze";
        if (totalBorrowed < 50) return "Silver";
        if (totalBorrowed < 100) return "Gold";
        return "Platinum";
    }
    
    // Override equals and hashCode
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Member member = (Member) obj;
        return Objects.equals(memberId, member.memberId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(memberId);
    }
    
    // toString method
    @Override
    public String toString() {
        return String.format("Member[ID=%s, Name=%s, Active=%s, Currently Borrowed=%d, Total Borrowed=%d]",
                memberId, name, active, getCurrentBorrowedCount(), getTotalBorrowedCount());
    }
    
    // Additional utility method for displaying member info
    public String getDisplayInfo() {
        return String.format("%s (%s) - %s Level, %d items borrowed, %d currently out",
                name, memberId, getMembershipLevel(), getTotalBorrowedCount(), getCurrentBorrowedCount());
    }
}