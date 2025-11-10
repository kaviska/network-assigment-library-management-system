-- Sample data for OakTown Library
USE oaktown_library;

-- Insert sample members
INSERT INTO members (member_id, name, email, phone, address) VALUES
('M001', 'John Smith', 'john.smith@email.com', '555-0101', '123 Main St, Oaktown'),
('M002', 'Sarah Johnson', 'sarah.j@email.com', '555-0102', '456 Oak Ave, Oaktown'),
('M003', 'Michael Brown', 'mike.brown@email.com', '555-0103', '789 Pine Rd, Oaktown'),
('M004', 'Emily Davis', 'emily.davis@email.com', '555-0104', '321 Elm St, Oaktown'),
('M005', 'David Wilson', 'david.w@email.com', '555-0105', '654 Maple Dr, Oaktown');

-- Insert sample library items (books)
INSERT INTO library_items (isbn, title, author, publication_year, item_type) VALUES
('978-0060935467', 'To Kill a Mockingbird', 'Harper Lee', 1960, 'BOOK'),
('978-0142424179', 'The Catcher in the Rye', 'J.D. Salinger', 1951, 'BOOK'),
('978-0743273565', 'The Great Gatsby', 'F. Scott Fitzgerald', 1925, 'BOOK'),
('978-0451524935', '1984', 'George Orwell', 1949, 'BOOK'),
('978-0061120084', 'The Lord of the Rings', 'J.R.R. Tolkien', 1954, 'BOOK');

-- Insert book details
INSERT INTO books (isbn, pages, genre) VALUES
('978-0060935467', 281, 'Fiction'),
('978-0142424179', 234, 'Fiction'),
('978-0743273565', 180, 'Fiction'),
('978-0451524935', 328, 'Dystopian Fiction'),
('978-0061120084', 1216, 'Fantasy');

-- Insert reference books
INSERT INTO library_items (isbn, title, author, publication_year, item_type) VALUES
('978-0199571123', 'Oxford English Dictionary', 'Oxford University Press', 2019, 'REFERENCE_BOOK'),
('978-0073383095', 'Campbell Biology', 'Jane Reece', 2017, 'REFERENCE_BOOK'),
('978-1337670654', 'Calculus: Early Transcendentals', 'James Stewart', 2020, 'REFERENCE_BOOK');

INSERT INTO books (isbn, pages, genre) VALUES
('978-0199571123', 2000, 'Reference'),
('978-0073383095', 1488, 'Science'),
('978-1337670654', 1344, 'Mathematics');

INSERT INTO reference_books (isbn, restricted) VALUES
('978-0199571123', FALSE),
('978-0073383095', TRUE),
('978-1337670654', TRUE);

-- Insert magazines
INSERT INTO library_items (isbn, title, author, publication_year, item_type) VALUES
('MAG-2024-001', 'National Geographic', 'National Geographic Society', 2024, 'MAGAZINE'),
('MAG-2024-002', 'Scientific American', 'Scientific American Inc.', 2024, 'MAGAZINE'),
('MAG-2024-003', 'Time Magazine', 'Time USA LLC', 2024, 'MAGAZINE'),
('MAG-2024-004', 'The Economist', 'The Economist Group', 2024, 'MAGAZINE');

INSERT INTO magazines (isbn, issue_number, volume, frequency) VALUES
('MAG-2024-001', 9, 245, 'Monthly'),
('MAG-2024-002', 3, 331, 'Monthly'),
('MAG-2024-003', 15, 204, 'Weekly'),
('MAG-2024-004', 37, 432, 'Weekly');

-- Insert some borrowing history
INSERT INTO borrowed_items (isbn, member_id, borrow_date, due_date, daily_cost, status) VALUES
('978-0060935467', 'M001', '2024-08-15', '2024-08-29', 0.50, 'RETURNED'),
('978-0142424179', 'M002', '2024-09-01', '2024-09-15', 0.50, 'BORROWED'),
('MAG-2024-001', 'M003', '2024-09-10', '2024-09-17', 0.25, 'BORROWED');

-- Update return date for returned items
UPDATE borrowed_items SET return_date = '2024-08-28', total_cost = 6.50 WHERE isbn = '978-0060935467' AND member_id = 'M001';