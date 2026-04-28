f# Lineup — KBC Digital

Internal editorial calendar for Kenya Broadcasting Corporation.

## Structure
- `/backend` — Node.js + Express + Firebase Admin
- `/frontend` — React (coming soon)

## Auth & Authorization
The system uses a hybrid approach for security:
- **Authentication**: Handled by Firebase Auth (Email/Password).
- **Authorization**: Roles are stored in Firestore for granular access control.

### User Roles
- `super_admin`: Full system access.
- `editor`: Can create and edit calendar events.
- `assignee`: Limited access to view and update assigned tasks.

## Progress
 - [x] Firebase Admin SDK Integration
 - [x] ESM Module Configuration
 - [x] Firestore-based Role Management
 - [x] User Registration with Roles
 - [x] User Verification and Role Retrieval
 - [x] Auth Test Suite

## Team
- Tjay — Backend
- Zipporah — Frontend