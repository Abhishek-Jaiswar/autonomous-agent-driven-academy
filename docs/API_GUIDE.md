# AstraLearn AI — API & WebSocket Reference Guide

## 🌐 HTTP REST API Endpoints

Base URL: `http://localhost:8000` (Local) / `https://<api-domain>` (Production)

### 🔑 Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/signup` | Register a new student account | No |
| `POST` | `/auth/login` | Sign in with email & password | No |
| `POST` | `/auth/logout` | Clear authentication session/cookie | Yes |
| `GET` | `/auth/me` | Fetch active authenticated user profile | Yes |

---

### 🗺️ Curriculum & Agent Execution (`/curriculum`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/curriculum/interview/start` | Start a new diagnostic interview session | Yes |
| `POST` | `/curriculum/interview/respond` | Send a response message to Counselor Agent | Yes |
| `GET` | `/curriculum/interview/:id` | Fetch diagnostic interview state & history | Yes |
| `POST` | `/curriculum/generate` | Trigger async pipeline to generate curriculum | Yes |
| `GET` | `/curriculum` | Fetch active user curricula | Yes |
| `GET` | `/curriculum/:id` | Fetch full curriculum with phases & lessons | Yes |
| `GET` | `/curriculum/lesson/:id` | Fetch specific lesson content & visual diagram | Yes |
| `POST` | `/curriculum/quiz/evaluate` | Submit quiz answer for Examiner Agent grading | Yes |

---

### 🩺 System Health (`/health`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Returns server health, timestamp, and API version | No |

---

## ⚡ Socket.io WebSocket Events

WebSocket Connection: `ws://localhost:8000`

### Client -> Server Events
- `subscribe:interview`: `{ interviewId: string }` — Subscribe to progress of a specific interview pipeline execution.
- `subscribe:curriculum`: `{ curriculumId: string }` — Subscribe to live curriculum generation updates.

### Server -> Client Events
- `agent:started`: `{ agentId: string, agentName: string, timestamp: string }`
- `agent:progress`: `{ agentId: string, message: string, percent: number }`
- `agent:completed`: `{ agentId: string, output: object }`
- `agent:error`: `{ agentId: string, error: string }`
