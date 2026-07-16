# AstraLearn AI: Postman & WebSocket Testing Guide

This guide describes how to import the test collection and execute verification steps for **Authentication** and **Phase 2 (Counseling & Profiling)** in Postman.

---

## 1. Import the Postman Collection

1. Open **Postman**.
2. Click the **Import** button in the top-left corner.
3. Select **Files** and upload the generated JSON file located at:
   `docs/astralearn_postman_collection.json`
4. Click **Import** to load the `AstraLearn AI API Collection`.

---

## 2. Testing Authentication Endpoints

Before starting a curriculum, you need to register an account and generate a JSON Web Token (JWT).

### Step 1: User Signup
* **Request**: `Authentication ➔ 1. User Signup`
* **Method**: `POST`
* **URL**: `http://localhost:8000/auth/signup`
* **Body (JSON)**:
  ```json
  {
    "email": "student@example.com",
    "password": "securedpassword123"
  }
  ```
* **Action**: Click **Send**.
* **Expected Output**: Status `201 Created` with confirmation that the user is written to the database.

### Step 2: User Login (Token Generation)
* **Request**: `Authentication ➔ 2. User Login`
* **Method**: `POST`
* **URL**: `http://localhost:8000/auth/login`
* **Body (JSON)**: Use same credentials.
* **Action**: Click **Send**.
* **Expected Output**: Status `200 OK` with a signed `token` field.
* **Postman Event**: The test script automatically extracts the `token` and writes it to the collection variables as `jwtToken`.

---

## 3. Testing Secured HTTP Endpoints

All curriculum endpoints now require the bearer authentication header `Authorization: Bearer <token>`. Postman handles this automatically using the `{{jwtToken}}` collection variable.

### Step 1: Start Curriculum Session
* **Request**: `Curriculum Intake (Secure) ➔ 1. Start Curriculum Session`
* **Method**: `POST`
* **URL**: `http://localhost:8000/curriculum/start`
* **Body (JSON)**: (Note: The `email` field is removed as the identity is derived from the JWT context).
  ```json
  {
    "goalText": "I want to learn Generative AI and build a RAG product recommendation system.",
    "category": "job_project",
    "durationDays": 21
  }
  ```
* **Action**: Click **Send**.
* **Expected Output**: Status `201 Created` returning a `goalId`.
* **Postman Event**: The `goalId` is automatically saved to the collection variables.

### Step 2: Get Curriculum Roadmap
* **Request**: `Curriculum Intake (Secure) ➔ 2. Get Curriculum Roadmap`
* **Method**: `GET`
* **URL**: `http://localhost:8000/curriculum/{{goalId}}`
* **Action**: Click **Send**.
* **Expected Output**: Status `200 OK` with the curriculum roadmap.

---

## 4. Testing WebSockets (Socket.IO)

Postman v10+ supports Socket.io. Connect and execute the Counselor Q&A.

### Step 1: Connect to WebSocket
1. Click **New ➔ WebSocket**.
2. Select **Socket.IO**.
3. **Connection URL**: Set to `http://localhost:8000`.
4. Click **Connect**. Check console logs for `Connected`.

### Step 2: Add Event Listeners
Add these server event names in the **Listen** panel:
* `interview-question`
* `profile-ready`
* `agent-log`
* `interview-completed`
* `interview-error`

### Step 3: Run the Counselor Q&A turns
1. **Join Room**:
   * Event: `join-session`
   * Payload: `"your-goal-id-here"` (string).
2. **Start Q&A**:
   * Event: `start-interview`
   * Payload (JSON): `{ "goalId": "your-goal-id-here" }`
   * Server returns first question in `interview-question`.
3. **Submit Answers**:
   * Emit event `submit-answer` with payload:
     ```json
     {
       "goalId": "your-goal-id-here",
       "answer": "I have intermediate Python skills and have done basic CRUD apps."
     }
     ```
   * Step through turns until completed.
4. **Profiler synthesis**:
   * Receive `profile-ready` showing baseline skills, styles, and weak areas.
