# Project Overview: Library Management System (Backend)

This repository contains a full-stack Library Management System. The backend (this folder) is a Java-based server application that exposes REST APIs and a WebSocket chat server. The frontend (separate `frontend/` folder) is a Next.js application that provides user and admin interfaces for managing items, members, borrowings, and real-time chat.

## Purpose

The system aims to provide a simple, integrated library management platform with the following high-level goals:
- Manage library items (books, magazines, reference books) and members
- Support borrowing and returning of items with persistence
- Provide admin features for managing members, items, and borrow records
- Support real-time chat between members and admins (moderated chat)
- Include tests and example data so the application can be run locally for evaluation and development

## High-level architecture

- Backend: Java (Maven) application
	- Packages: `com.oaktown.library` with subpackages `dao`, `model`, `service`, `util`
	- Servers: `RestApiServer` (REST API) and `WebSocketChatServer` (WebSocket-based chat)
	- Utilities: `DatabaseConnection`, `SessionManager` for DB connectivity and session/auth handling
- Frontend: Next.js (React + TypeScript) app in `../frontend`
- Database: local relational DB (schema in `src/resources/schema.sql`, sample data in `sample_data.sql`)

The backend exposes REST endpoints consumed by the Next.js frontend and also directly supports WebSocket connections for chat.

## Key components and features

Backend (Java)
- Authentication and session management
	- `AuthService` provides authentication flows and token/session logic (backed by `SessionManager`).
- Library core service
	- `Library` in `service/` implements business logic: listing/searching items, borrowing, returning, and reporting.
- Data access objects (DAO)
	- `LibraryItemDAO`, `MemberDAO`, `BorrowingDAO`, `AdminDAO`, `ChatMessageDAO` provide persistence logic for domain entities.
- Domain models
	- Core model classes: `LibraryItem` (base), `Book`, `Magazine`, `ReferenceBook`, `Member`, `Admin`, `ChatMessage`.
- Servers
	- `RestApiServer.java` — REST API endpoints for CRUD operations, auth, and library operations.
	- `WebSocketChatServer.java` — real-time chat for members and admins; stores chat messages via `ChatMessageDAO`.
- Utilities
	- `DatabaseConnection.java` — handles JDBC connection pooling/config using `config.properties`.
	- `SessionManager.java` — manages in-memory session state (or token validation) for authenticated users.

Frontend (Next.js)
- Admin UI: manage items, members, borrowings, and chat moderation (components such as `AdminManager.tsx`, `ItemsManager.tsx`, `MembersManager.tsx`, `BorrowingManager.tsx`, `AdminChat.tsx`).
- Member UI: login and member chat page, browsing items, borrowing requests.
- Shared services: `apiService.ts` (REST API client), `chatService.ts` (WebSocket client), `AuthContext.tsx` for auth state.

Data model (summary)
- LibraryItem (abstract) — shared fields: id, title, authors, year, status, etc.
- Book — extends LibraryItem: ISBN, pages, publisher
- Magazine — extends LibraryItem: issue, periodicity
- ReferenceBook — extends LibraryItem: reference-only flag (non-borrowable)
- Member — user profile: id, name, contact, membership info
- Admin — administrator accounts with elevated privileges
- ChatMessage — message text, sender id/type (admin/member), timestamp

Persistence
- SQL schema: `src/resources/schema.sql` defines tables for items, members, borrowings, admins, and chat messages.
- Example data: `src/resources/sample_data.sql` populates sample items and members for quick testing.

Automated tests
- Unit tests for models and services are present under `src/test/java` (e.g., `BookTest`, `MagazineTest`, `ReferenceBookTest`, `LibraryTest`). These use the test configuration in `test/resources/test-config.properties`.

How to run (quick local guide)

Backend (Java / Maven)
1. Build and run tests:

	 mvn test

2. Prepare runtime dependencies (already done in CI or you can copy dependencies locally):

	 mvn dependency:copy-dependencies -DoutputDirectory=target\\dependency

3. Run the server(s):

	 java -cp "target/classes;target/dependency/*" com.oaktown.library.RestApiServer

	 (In a separate terminal) to run the chat server if needed:

	 java -cp "target/classes;target/dependency/*" com.oaktown.library.WebSocketChatServer

Note: On Windows PowerShell ensure correct quoting for classpath separators (`;`).

Frontend (Next.js)
1. Change to `frontend/` and install dependencies:

	 cd ..\\frontend
	 npm install

2. Start the development server:

	 npm run dev

The frontend uses `apiService.ts` to call backend REST endpoints. Ensure the backend `RestApiServer` is running and that `config.properties` includes the correct DB and server configuration.

Configuration files
- `src/resources/config.properties` — DB connection, server ports, and other runtime configuration.
- `schema.sql` and `sample_data.sql` — schema and sample data for initializing the DB.

Testing
- Backend tests: `mvn test` runs the JUnit tests in `src/test/java`.
- Frontend tests: (if present) run via the frontend package scripts (not included by default in this project snapshot).

Developer notes & assumptions
- The backend is Maven-based and built into `target/` (already present in the repository tree).
- Database: the code expects a relational DB accessible via JDBC settings in `config.properties`. For local development, an embedded H2 or a local MySQL/Postgres instance can be used depending on configuration.
- The WebSocket chat server persists chat messages via `ChatMessageDAO` so chat history is stored server-side.

Next steps and improvement ideas
- Add API documentation (OpenAPI/Swagger) for the REST endpoints.
- Add Dockerfiles and a docker-compose to start DB + backend + frontend for reproducible local dev.
- Add integration tests that start an in-memory DB and validate REST + WebSocket flows.
- Add CI pipeline to run `mvn test` and frontend lint/tests on push/PR.
- Secure authentication tokens (JWT) and add role-based access control for admin endpoints.

Contact / where to look
- Backend entry points: `RestApiServer.java`, `WebSocketChatServer.java`, `App.java`.
- Business logic: `service/Library.java`, `service/AuthService.java`.
- Data access: `dao/*DAO.java` files.

---

If you'd like, I can also:
- update the README with this summary at the repository root or the frontend README;
- add a Docker Compose file to make running the stack locally one command;
- extract and generate a concise API reference (endpoints and request/response shapes) by scanning the `RestApiServer` and controller code.

Let me know which follow-up you'd like next and I'll make those edits.

