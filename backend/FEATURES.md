Feature list for Library Management System

This file documents the main features of the application, grouped by user area and system component.

1) Core user (Member) features
- User authentication (login / session management via `AuthService` + `SessionManager`)
- Browse library catalog (books, magazines, reference books)
- View item details (metadata: title, authors, year, ISBN/issue, availability)
- Borrow an item (create borrowing record; backend persisted via `BorrowingDAO`)
- Return an item (update borrowing record and item availability)
- View own borrow history and current loans
- Member-to-admin chat (real-time) via WebSocket (connect, send/receive messages)
- Client-side auth state via `AuthContext.tsx`

2) Admin features
- Admin authentication and session management
- Admin dashboard (`Dashboard.tsx`) with quick access to management features
- Manage library items (CRUD for books, magazines, reference books) — `ItemsManager.tsx`
- Manage members (create, edit, view, delete) — `MembersManager.tsx`
- Manage borrowings (approve/record borrows and returns, view overdue items) — `BorrowingManager.tsx`
- Admin chat moderation / respond to member chats (`AdminChat.tsx`, `AdminManager.tsx`)
- Search and list filters for items/members/borrowings

3) Real-time & communication
- WebSocket chat server (`WebSocketChatServer.java`) for bi-directional, low-latency messaging
- Persist chat history (`ChatMessageDAO`, `ChatMessage` model)
- Frontend `chatService.ts` to manage socket connections

4) Data & persistence
- Relational schema in `src/resources/schema.sql` (items, members, borrowings, admins, chat, etc.)
- Sample data loader `sample_data.sql` for local testing
- JDBC-based DB connection via `DatabaseConnection.java`
- DAO layer: `LibraryItemDAO`, `MemberDAO`, `BorrowingDAO`, `AdminDAO`, `ChatMessageDAO`

5) API & integration
- REST API server (`RestApiServer.java`) exposing endpoints for items, members, borrowings, auth, and chat support
- Frontend REST client `apiService.ts` to call backend endpoints
- Clear separation between service (business logic) and DAO (persistence)

6) Business rules & domain behaviors
- Reference books flagged as reference-only (non-borrowable) via `ReferenceBook` model
- Borrowing lifecycle management (borrow, due date, return) implemented in `service/Library.java`
- Role-based behavior: admin vs member (server enforces elevated admin actions)

7) Testing & quality
- Unit tests for models and services under `src/test/java` (e.g., `LibraryTest`, `BookTest`)
- Test resources under `test/resources/test-config.properties`
- Maven-based build and test lifecycle (`pom.xml`)

8) Developer & tooling features
- Maven build, dependency management, output (`target/`), dependency copy command for running JAR/classpath
- Frontend: Next.js (TypeScript) app with components for admin/member flows
- Central config file `src/resources/config.properties` for DB/ports/settings

9) Deployment & operations (current / minimal)
- Local-runable backend via Java classpath (instructions in `backend/overview.md`)
- Frontend run by `npm run dev` in `frontend/`
- No Docker/compose or CI currently included (good candidate next steps)

10) Security & operational concerns
- Session-based auth; opportunity to upgrade to JWT and HTTPS in production
- Access control per role required (admin endpoints should be protected)
- Input validation and DB parameterization likely present in DAOs — verify for SQL injection protection

11) Optional / future features (recommended)
- OpenAPI/Swagger docs for REST endpoints
- Docker + docker-compose (DB, backend, frontend)
- Integration tests spinning up an in-memory DB and test WebSocket flows
- Role-based permissions & stronger auth (JWT, password hashing, salted storage)
- Notifications for overdue items and automated reminders
- Pagination, advanced search, and export (CSV/PDF) reporting

---

To link this document into the project, consider adding a link from `backend/overview.md` or the repository root `README.md`.
