# OakTown Library Management System - Test Plan

## Overview
This document outlines the comprehensive testing strategy for the OakTown Library Management System, including unit tests for core classes and interface tests for the main application.

## Test Framework
- **JUnit 5**: Primary testing framework
- **Mockito**: For mocking dependencies in service layer tests
- **H2 Database**: In-memory database for integration tests (if needed)

## Unit Tests

### 1. Book Class Tests (`BookTest.java`)

#### Test Categories:
- **Constructor Tests**
  - Valid parameter creation
  - Default genre handling
  - Null parameter validation
  - Invalid page number validation

- **Business Logic Tests**
  - Daily cost calculation
  - Item type identification
  - Book categorization (short/medium/long/very long)
  - Reference book status

- **Inheritance Tests**
  - Abstract method implementations
  - Polymorphic behavior
  - Template method usage

- **State Management Tests**
  - Borrow/return operations
  - Availability status
  - Error conditions

#### Key Test Methods:
```java
@Test void testConstructorWithAllParameters()
@Test void testConstructorWithNullIsbn()
@Test void testCalculateDailyCost()
@Test void testBorrowAndReturn()
@Test void testCalculateTotalCostInvalidDays()
```

### 2. ReferenceBook Class Tests (`ReferenceBookTest.java`)

#### Test Categories:
- **Inheritance Verification**
  - Proper extension of Book class
  - Method overriding validation
  - Polymorphic behavior

- **Restriction Logic Tests**
  - Borrowing restrictions for restricted books
  - Access level determination
  - Special handling requirements

- **Business Rules Tests**
  - Daily cost calculation (higher rate)
  - Restriction status changes
  - Error handling for restricted operations

#### Key Test Methods:
```java
@Test void testCanBeBorrowed()
@Test void testBorrowRestrictedItem()
@Test void testSetRestrictedWhenBorrowed()
@Test void testPolymorphism()
```

### 3. Magazine Class Tests (`MagazineTest.java`)

#### Test Categories:
- **Magazine-Specific Features**
  - Issue number and volume validation
  - Frequency handling
  - Magazine identifier formatting

- **Business Logic Tests**
  - Daily cost calculation
  - Maximum borrow days by frequency
  - Current vs archive issue logic

- **Validation Tests**
  - Constructor parameter validation
  - Setter method validation
  - Frequency constants

#### Key Test Methods:
```java
@Test void testGetMaxBorrowDays()
@Test void testMagazineIdentifier()
@Test void testFrequencyConstants()
@Test void testCaseInsensitiveFrequency()
```

### 4. Library Service Tests (`LibraryTest.java`)

#### Test Categories:
- **Service Layer Logic**
  - All public method functionality
  - Business rule enforcement
  - Error handling and validation

- **DAO Integration Tests**
  - Proper delegation to DAO objects
  - Mock verification
  - Return value handling

- **Transaction Logic Tests**
  - Borrowing operations
  - Return operations
  - Cost calculations

#### Key Test Methods:
```java
@Test void testBorrowItemSuccess()
@Test void testBorrowItemNonExistentMember()
@Test void testReturnItemSuccess()
@Test void testGetLibraryStatistics()
```

## Interface Tests for App.java

### 1. Menu System Tests

#### Test Scenarios:
- **Valid Menu Selection**
  - Each menu option (1-8) produces expected behavior
  - Proper navigation flow
  - Correct method invocation

- **Invalid Input Handling**
  - Non-numeric input
  - Out-of-range selections
  - Empty input

- **User Flow Tests**
  - Complete borrowing workflow
  - Complete return workflow
  - Search operations
  - Cost calculations

### 2. Input Validation Tests

#### Test Categories:
- **ISBN Validation**
  - Valid ISBN formats
  - Invalid/empty ISBN handling
  - Non-existent ISBN handling

- **Member ID Validation**
  - Valid member ID formats
  - Invalid/empty member ID handling
  - Non-existent member handling

- **Numeric Input Validation**
  - Valid number of days
  - Invalid/negative numbers
  - Non-numeric input

### 3. Database Connection Tests

#### Test Scenarios:
- **Successful Connection**
  - Application startup with valid database
  - Proper initialization message
  - Menu display

- **Failed Connection**
  - Application behavior with unavailable database
  - Error message display
  - Graceful failure

### 4. Output Formatting Tests

#### Test Categories:
- **List Display Tests**
  - Proper table formatting
  - Data truncation for long text
  - Empty list handling

- **Search Result Tests**
  - Result formatting
  - No results found handling
  - Keyword highlighting

- **Transaction Confirmation Tests**
  - Success message formatting
  - Error message display
  - Cost calculation display

## Test Execution Strategy

### 1. Automated Unit Tests
```bash
# Run all unit tests
mvn test

# Run specific test class
mvn test -Dtest=BookTest

# Run with coverage
mvn test jacoco:report
```

### 2. Manual Interface Tests

#### Test Case 1: Complete Borrowing Process
1. Start application
2. Select menu option 3 (Borrow item)
3. Enter valid ISBN: "978-0060935467"
4. Enter valid Member ID: "M001"
5. Enter borrowing days: "14"
6. Confirm transaction
7. Verify success message
8. Check item status in database

#### Test Case 2: Search Functionality
1. Start application
2. Select menu option 2 (Search available items)
3. Enter keyword: "Mockingbird"
4. Verify search results display
5. Confirm only available items shown

#### Test Case 3: Error Handling
1. Start application
2. Select menu option 3 (Borrow item)
3. Enter invalid ISBN: "invalid-isbn"
4. Verify error message
5. Test with non-existent member ID
6. Verify appropriate error handling

#### Test Case 4: Cost Calculation
1. Start application
2. Select menu option 5 (Calculate cost)
3. Enter ISBN for different item types
4. Test with various day counts
5. Verify cost calculations match expected rates

### 3. Integration Tests

#### Database Integration Tests
- Test with actual MySQL database
- Verify CRUD operations
- Test transaction handling
- Verify data consistency

#### Full System Tests
- End-to-end borrowing and returning
- Member management operations
- Library statistics accuracy
- Concurrent user simulation (if applicable)

## Test Data Management

### Test Database Setup
```sql
-- Create test-specific data
INSERT INTO members (member_id, name, email, phone, address) VALUES
('TEST001', 'Test User 1', 'test1@test.com', '555-0001', 'Test Address 1'),
('TEST002', 'Test User 2', 'test2@test.com', '555-0002', 'Test Address 2');

-- Create test items
INSERT INTO library_items (isbn, title, author, publication_year, item_type) VALUES
('TEST-BOOK-001', 'Test Book', 'Test Author', 2024, 'BOOK'),
('TEST-MAG-001', 'Test Magazine', 'Test Publisher', 2024, 'MAGAZINE');
```

### Test Data Cleanup
- Automated cleanup after test execution
- Test data isolation
- Consistent test environment

## Expected Test Results

### Unit Test Coverage
- **Minimum 90%** code coverage for model classes
- **Minimum 85%** code coverage for service classes
- **100%** method coverage for public APIs

### Interface Test Results
- All menu options functional
- Proper error handling for invalid inputs
- Consistent user experience
- Database operations successful

## Test Environment Setup

### Prerequisites
1. Java 11+ installed
2. Maven 3.6+ installed
3. MySQL 8.0+ running
4. Test database created and configured

### Configuration
```properties
# Test configuration (test-config.properties)
db.url=jdbc:mysql://localhost:3306/oaktown_library_test
db.username=test_user
db.password=test_password
```

### Running Tests
```bash
# Setup test environment
mvn clean compile

# Run all tests
mvn test

# Run specific test suites
mvn test -Dtest=*ModelTest
mvn test -Dtest=*ServiceTest

# Generate test reports
mvn surefire-report:report
```

## Continuous Integration

### Automated Test Pipeline
1. Code commit triggers tests
2. Unit tests execute first
3. Integration tests follow
4. Interface tests run last
5. Test reports generated
6. Code coverage analysis

### Quality Gates
- All unit tests must pass
- Minimum coverage thresholds met
- No critical bugs detected
- Performance benchmarks met

## Defect Tracking

### Bug Categories
- **Critical**: Application crashes, data corruption
- **Major**: Core functionality broken
- **Minor**: UI issues, non-critical features
- **Enhancement**: Performance improvements, new features

### Test Metrics
- Test execution time
- Pass/fail rates
- Code coverage percentages
- Defect density
- Test case effectiveness

This comprehensive test plan ensures the OakTown Library Management System meets all requirements and maintains high quality standards through thorough testing at all levels.