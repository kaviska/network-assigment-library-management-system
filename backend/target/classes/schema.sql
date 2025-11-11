-- OakTown Library Database Schema
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS oaktown_library;
USE oaktown_library;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS borrowed_items;
DROP TABLE IF EXISTS reference_books;
DROP TABLE IF EXISTS magazines;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS library_items;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS admins;

-- Admins table (for authentication)
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Will store hashed passwords
    name VARCHAR(100) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    active BOOLEAN DEFAULT TRUE,
    created_by INT NULL,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- Members table
CREATE TABLE members (
    member_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    registration_date DATE DEFAULT (CURRENT_DATE),
    active BOOLEAN DEFAULT TRUE
);

-- Library Items (parent table)
CREATE TABLE library_items (
    isbn VARCHAR(20) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    publication_year INT NOT NULL,
    item_type ENUM('BOOK', 'REFERENCE_BOOK', 'MAGAZINE') NOT NULL,
    current_borrower VARCHAR(10) NULL,
    available BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (current_borrower) REFERENCES members(member_id) ON DELETE SET NULL
);

-- Books table (extends library_items)
CREATE TABLE books (
    isbn VARCHAR(20) PRIMARY KEY,
    pages INT NOT NULL,
    genre VARCHAR(50),
    FOREIGN KEY (isbn) REFERENCES library_items(isbn) ON DELETE CASCADE
);

-- Reference Books table (extends books)
CREATE TABLE reference_books (
    isbn VARCHAR(20) PRIMARY KEY,
    restricted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (isbn) REFERENCES books(isbn) ON DELETE CASCADE
);

-- Magazines table (extends library_items)
CREATE TABLE magazines (
    isbn VARCHAR(20) PRIMARY KEY,
    issue_number INT NOT NULL,
    volume INT,
    frequency VARCHAR(20), -- weekly, monthly, quarterly
    FOREIGN KEY (isbn) REFERENCES library_items(isbn) ON DELETE CASCADE
);

-- Borrowed Items (for tracking borrowing history)
CREATE TABLE borrowed_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) NOT NULL,
    member_id VARCHAR(10) NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    daily_cost DECIMAL(5,2) DEFAULT 0.50,
    total_cost DECIMAL(8,2) NULL,
    status ENUM('BORROWED', 'RETURNED', 'OVERDUE') DEFAULT 'BORROWED',
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (isbn) REFERENCES library_items(isbn) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    INDEX idx_member_status (member_id, status),
    INDEX idx_isbn_status (isbn, status),
    INDEX idx_borrow_date (borrow_date),
    INDEX idx_due_date (due_date)
);

-- Triggers to update library_items availability
DELIMITER //

CREATE TRIGGER after_borrow_insert 
AFTER INSERT ON borrowed_items
FOR EACH ROW
BEGIN
    IF NEW.status = 'BORROWED' THEN
        UPDATE library_items 
        SET current_borrower = NEW.member_id, available = FALSE 
        WHERE isbn = NEW.isbn;
    END IF;
END//

CREATE TRIGGER after_borrow_update 
AFTER UPDATE ON borrowed_items
FOR EACH ROW
BEGIN
    IF NEW.status = 'RETURNED' AND OLD.status = 'BORROWED' THEN
        UPDATE library_items 
        SET current_borrower = NULL, available = TRUE 
        WHERE isbn = NEW.isbn;
    END IF;
END//

DELIMITER ;

-- Views for easy querying
CREATE VIEW available_items AS
SELECT li.*, 
       CASE 
           WHEN li.item_type = 'BOOK' THEN b.pages
           WHEN li.item_type = 'REFERENCE_BOOK' THEN b.pages
           ELSE NULL 
       END as pages,
       CASE 
           WHEN li.item_type = 'REFERENCE_BOOK' THEN rb.restricted
           ELSE NULL 
       END as restricted,
       CASE 
           WHEN li.item_type = 'MAGAZINE' THEN m.issue_number
           ELSE NULL 
       END as issue_number
FROM library_items li
LEFT JOIN books b ON li.isbn = b.isbn
LEFT JOIN reference_books rb ON li.isbn = rb.isbn
LEFT JOIN magazines m ON li.isbn = m.isbn
WHERE li.available = TRUE;

CREATE VIEW current_borrowings AS
SELECT bi.*, li.title, li.author, m.name as member_name
FROM borrowed_items bi
JOIN library_items li ON bi.isbn = li.isbn
JOIN members m ON bi.member_id = m.member_id
WHERE bi.status = 'BORROWED';