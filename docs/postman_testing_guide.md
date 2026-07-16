# AstraLearn AI: Postman & WebSocket Testing Guide

This guide describes how to import the test collection and execute verification steps for **Phase 2 (Counseling & Profiling)** in Postman.

---

## 1. Import the Postman Collection

1. Open **Postman**.
2. Click the **Import** button in the top-left corner.
3. Select **Files** and upload the generated JSON file located at:
   `docs/astralearn_postman_collection.json`
4. Click **Import** to load the `AstraLearn AI API Collection`.

---

## 2. Testing HTTP Endpoints

The collection is equipped with an **auto-save test script** that automatically extracts the `goalId` from successful initialization runs and writes it to the collection variables for subsequent calls.

### Step 1: Start Curriculum Session
* **Request**: `HTTP Endpoints ➔ 1. Start Curriculum Session`
* **Method**: `POST`
* **URL**: `http://localhost:8000/curriculum/start`
* **Action**: Click **Send**.
* **Expected Output**:
  ```json
  {
    "success": true,
    "data": {
      "goalId": "your-uuid-here",
      "curriculumId": "your-uuid-here",
      "message": "Goal session initialized. Please join the WebSocket room to start the counselor interview."
    }
  }
  ```
* **Postman Event**: The test script automatically saves the returned `goalId` into the collection variables. You can view this variable by clicking on the collection name and selecting the **Variables** tab.

### Step 2: Get Curriculum details (Optional at this stage)
* **Request**: `HTTP Endpoints ➔ 2. Get Curriculum Roadmap`
* **Method**: `GET`
* **URL**: `http://localhost:8000/curriculum/{{goalId}}`
* **Action**: Click **Send**.
* **Expected Output**: Returns status `200 OK` with the placeholder curriculum metadata (phases list is empty for now as it compiles during Phase 3/4 background workers).

---

## 3. Testing WebSockets (Socket.IO)

Postman v10+ has native support for Socket.io. Follow these steps to connect and run the dynamic Counselor Q&A.

### Step 1: Create a Socket.io Request
1. In Postman, click **New ➔ WebSocket**.
2. Select **Socket.IO** (do **not** select raw WebSockets).
3. **Connection URL**: Set to `http://localhost:8000`.
4. Click **Connect**. The console log should print `Connected`.

### Step 2: Configure Server Listeners
Before sending messages, add listeners in the **Listen** tab to see incoming server broadcasts:
1. Under the **Listen** panel, add the following event names:
   * `interview-question`
   * `profile-ready`
   * `agent-log`
   * `interview-completed`
   * `interview-error`

### Step 3: Join the Learning Session Room
1. Under the **Message** panel, type the event name: `join-session`.
2. Set parameter type to **JSON**.
3. **Payload**: Input your `goalId` string (e.g. `"50e79124-74d7-400d-9fb4-0f6bfaec2cb5"`).
4. Click **Send**. You should see a log of the connection joining the room room.

### Step 4: Initiate the Interview
1. Set event name: `start-interview`.
2. **Payload (JSON)**:
   ```json
   {
     "goalId": "your-goal-id-here"
   }
   ```
3. Click **Send**.
4. **Expected Broadcast**: You will receive an `interview-question` event containing:
   * `question`: The first dynamic intake question (e.g. "What is your Python background?").
   * `questionIndex`: `0`
   * `totalQuestions`: `4`

### Step 5: Answer the Questions
For each of the 4 turns, emit a `submit-answer` event:
1. Set event name: `submit-answer`.
2. **Payload (JSON)**:
   ```json
   {
     "goalId": "your-goal-id-here",
     "answer": "I have intermediate Python skills and have done basic CRUD apps."
   }
   ```
3. Click **Send**.
4. **Expected Broadcasts**: The server returns the next `interview-question` (indices `1`, `2`, `3`).

### Step 6: Verify Profiler Synthesis
On the **4th submission** (final answer):
* **Expected Broadcasts**:
  1. `agent-log`: `"Profile compiled successfully! Librarian Agent starting resource discovery..."`
  2. `profile-ready`: Contains the compiled skills, learning style, and predicted weak areas.
  3. `interview-completed`: Confirms session completion.
* **Database Check**: Run `npx prisma studio` and check the `Profile` record to verify the `interviewChat` JSON array now holds the complete Q&A log, and that `skillBaseline`, `learningStyle`, and `weakAreas` have been persisted.
