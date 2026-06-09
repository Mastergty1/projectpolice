# Backend Methods Summary

This document provides a summary of all API endpoints and their corresponding controller methods in the backend.

## 1. Authentication (`/api/v1/auth`)
Handles user registration, login, and session management.
- **Controller:** `backend/controllers/auth.js`
- **Routes:** `backend/routes/auth.js`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `register` | `POST /register` | Public | Registers a new user with name and password. |
| `login` | `POST /login` | Public | Authenticates user and returns a JWT token via cookie. |
| `logout` | `GET /logout` | Private | Logs out the user and clears the authentication cookie. |
| `getMe` | `GET /me` | Private | Returns the profile data of the currently logged-in user. |

---

## 2. Documents (`/api/v1/documents`)
Handles document upload and OCR processing using Gemini.
- **Controller:** `backend/controllers/documentController.js`
- **Routes:** `backend/routes/documents.js`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `processDocuments`| `POST /process` | Public | Uploads files and uses Gemini AI to extract task information. Returns temporary results. |

---

## 3. Tasks (`/api/v1/tasks`)
Core task management system including CRUD operations and status updates.
- **Controller:** `backend/controllers/taskController.js`
- **Routes:** `backend/routes/tasks.js`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `getAllTasks` | `GET /` | Public | Retrieves all tasks with their assignees and basic details. |
| `getUrgentTasks` | `GET /urgent` | Public | Retrieves only tasks marked as urgent. |
| `getTaskById` | `GET /:id` | Public | Retrieves comprehensive details for a specific task. |
| `createTask` | `POST /` | Public | Manually creates a new task with assignments and topics. |
| `confirmTasks` | `POST /confirm` | Public | Confirms and permanently saves scanned tasks/documents. Uploads to Google Drive. |
| `updateTaskStatus`| `PUT /:id/status`| Public | Quickly updates the status (e.g., following, completed) of a task. |
| `updateTaskDetail`| `PUT /:id` | Public | Updates full task details, including assignments and sub-topics. |
| `deleteTask` | `DELETE /:id` | Public | Permanently deletes a task and its associated assignments/topics. |

---

## 4. Users (`/api/v1/users`)
User profile management and directory.
- **Controller:** `backend/controllers/users.js`
- **Routes:** `backend/routes/users.js`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `getUsers` | `GET /` | Public | Returns a list of all registered users (IDs, names, colors). |
| `updateMyProfile` | `PUT /profile` | Private | Updates the current user's display name or theme color. |
| `changePassword` | `PUT /password`| Private | Allows the current user to update their login password. |

---

*Note: "Private" access indicates that the route is protected by the `protect` middleware and requires a valid JWT token.*
