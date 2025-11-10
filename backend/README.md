# OakTown Library Management System

A comprehensive Java library management system built with Object-Oriented Programming principles, Maven, and MySQL database integration.

## Features

- **Object-Oriented Design**: Demonstrates inheritance, polymorphism, abstraction, and encapsulation
- **Database Integration**: MySQL database with proper normalization and relationships
- **Library Operations**: Complete CRUD operations for books, reference books, magazines, and members
- **Borrowing System**: Track borrowing and returning of items with cost calculation
- **Search Functionality**: Find items by title keywords and member information
- **Console Interface**: User-friendly menu-driven interface
- **Comprehensive Testing**: JUnit 5 tests with Mockito for all major components

## System Requirements

- Java 11 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher
- XAMPP (or standalone MySQL server)

## Project Structure

```
library-sys/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/oaktown/library/
│   │   │       ├── model/           # Entity classes
│   │   │       │   ├── LibraryItem.java (abstract)
│   │   │       │   ├── Book.java
│   │   │       │   ├── ReferenceBook.java
│   │   │       │   ├── Magazine.java
│   │   │       │   └── Member.java
│   │   │       ├── dao/             # Data Access Objects
│   │   │       │   ├── LibraryItemDAO.java
│   │   │       │   ├── MemberDAO.java
│   │   │       │   └── BorrowingDAO.java
│   │   │       ├── service/         # Business Logic
│   │   │       │   └── Library.java
│   │   │       ├── util/            # Utilities
│   │   │       │   └── DatabaseConnection.java
│   │   │       └── App.java         # Main Application
│   │   └── resources/
│   │       ├── config.properties    # Database configuration
│   │       ├── schema.sql          # Database schema
│   │       └── sample_data.sql     # Sample data
│   └── test/
│       └── java/                   # JUnit tests
├── pom.xml                         # Maven configuration
└── README.md                       # This file
```

## OOP Principles Demonstrated

### 1. Abstraction
- `LibraryItem` is an abstract class with abstract methods
- Defines common interface while hiding implementation details

### 2. Inheritance
- `Book` extends `LibraryItem`
- `ReferenceBook` extends `Book`
- `Magazine` extends `LibraryItem`

### 3. Polymorphism
- Method overriding (e.g., `calculateDailyCost()`, `getItemType()`)
- Runtime polymorphism through interface references

### 4. Encapsulation
- Private fields with public getters/setters
- Protected methods for subclass access
- Validation in constructors and setters

## Database Setup

### 1. Start MySQL Server
Ensure your MySQL server is running (via XAMPP or standalone installation).

### 2. Create Database
```sql
-- Run this in MySQL Workbench or command line
source src/main/resources/schema.sql;
```

### 3. Insert Sample Data (Optional)
```sql
source src/main/resources/sample_data.sql;
```

### 4. Configure Database Connection
Edit `src/main/resources/config.properties`:
```properties
db.url=jdbc:mysql://localhost:3306/oaktown_library
db.username=root
db.password=your_password
```

## Building and Running

### 1. Compile the Project
```bash
mvn clean compile
```

### 2. Run Tests
```bash
mvn test
```

### 3. Run the Application
```bash
mvn exec:java -Dexec.mainClass="com.oaktown.library.App"
```

Or use the Maven exec plugin:
```bash
mvn exec:java
```

## Menu Options

1. **List all library items** - Shows all items regardless of availability
2. **Search available items** - Find available items by title keyword
3. **Borrow an item** - Borrow an item using ISBN and member ID
4. **Return an item** - Return a borrowed item
5. **Calculate borrowing cost** - Calculate cost for borrowing period
6. **List member's current borrowings** - Show items currently borrowed by member
7. **List member's borrowing history** - Show member's borrowing history
8. **Exit** - Exit the application

## Sample Usage

### Adding Test Data
The system includes sample members and items:
- Members: M001-M005 (John Smith, Sarah Johnson, etc.)
- Books: Classic literature with proper ISBN numbers
- Reference Books: Academic texts (some restricted)
- Magazines: Current issues of popular magazines

### Borrowing Process
1. Select option 3 (Borrow an item)
2. Enter ISBN (e.g., 978-0060935467)
3. Enter Member ID (e.g., M001)
4. Specify borrowing period (default 14 days)
5. Confirm the transaction

## Cost Structure

- **Books**: $0.50 per day
- **Reference Books**: $1.00 per day
- **Magazines**: $0.25 per day
- **Restricted Reference Books**: Cannot be borrowed

## Testing

### Unit Tests
```bash
mvn test
```

Tests cover:
- All entity classes (Book, ReferenceBook, Magazine, Member)
- Library service class with mocked dependencies
- Edge cases and error conditions
- OOP principles validation

### Test Coverage
- **BookTest**: 15+ test methods covering all functionality
- **ReferenceBookTest**: Tests inheritance and restriction logic
- **MagazineTest**: Tests magazine-specific features
- **LibraryTest**: Tests service layer with Mockito mocks

## Architecture Highlights

### Design Patterns
- **Singleton**: DatabaseConnection
- **DAO Pattern**: Separation of data access logic
- **Facade Pattern**: Library service provides simple interface
- **Template Method**: LibraryItem.calculateTotalCost()

### Database Design
- Normalized tables with proper foreign keys
- Inheritance mapping (table-per-class hierarchy)
- Triggers for maintaining data consistency
- Views for complex queries

### Error Handling
- Comprehensive input validation
- Proper exception handling with meaningful messages
- Transaction management for data consistency

## Development Notes

### Maven Dependencies
- MySQL Connector: Database connectivity
- JUnit 5: Unit testing framework
- Mockito: Mocking framework for tests
- H2 Database: In-memory database for testing

### Code Quality
- Comprehensive JavaDoc documentation
- Consistent naming conventions
- Proper error handling and validation
- Clean separation of concerns

## Troubleshooting

### Database Connection Issues
1. Verify MySQL is running
2. Check database credentials in `config.properties`
3. Ensure `oaktown_library` database exists
4. Verify network connectivity to MySQL server

### Compilation Issues
1. Ensure Java 11+ is installed
2. Verify Maven is properly configured
3. Check internet connection for dependency download

### Runtime Issues
1. Check console output for detailed error messages
2. Verify sample data is loaded correctly
3. Ensure proper input format (ISBN, Member ID patterns)

## Future Enhancements

- Web interface using Spring Boot
- REST API endpoints
- Advanced search filters
- Email notifications for due dates
- Fine calculation for overdue items
- Member categories with different privileges
- Integration with external library systems

## License

This project is developed for educational purposes as part of a Java OOP programming course.

## Author

Developed for OakTown Library as a demonstration of Java Object-Oriented Programming principles and database integration.