<div align="center">
  <h1>CipherChat Backend</h1>
  <p>The highly scalable, Zero-Knowledge backend architecture for the CipherChat platform.</p>

  <p>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-16.0+-339933?logo=nodedotjs&logoColor=white" alt="Node.js version" /></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white" alt="Express.js" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-6.0+-47A248?logo=mongodb&logoColor=white" alt="MongoDB" /></a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API"><img src="https://img.shields.io/badge/WebSockets-ws-black" alt="WebSockets" /></a>
  </p>
</div>

---

## Table of Contents

- [About](#about)
- [Key Features](#key-features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Architecture & Security](#architecture--security)
- [Contributing](#contributing)

---

## About

The CipherChat backend is a Node.js/Express server designed strictly around a "Zero-Knowledge" security model. It serves as a secure relay and persistence layer, routing end-to-end encrypted WebSocket packets and storing opaque cryptographic blobs in MongoDB. It has been engineered to ensure that even in the event of a total database compromise, user message plaintext remains mathematically inaccessible.

## Key Features

- **Zero-Knowledge Architecture:** The server operates without ever possessing the keys required to decrypt user messages.
- **Real-Time WebSocket Relay:** High-performance, authenticated WebSocket server for sub-millisecond message delivery and typing indicator synchronization.
- **Robust Security Middleware:** Hardened with `helmet` for HTTP headers, `express-rate-limit` for brute-force mitigation, and strict CORS policies.
- **Scalable Data Layer:** Utilizes Mongoose ODM with carefully designed schemas optimized for fast retrieval of conversational metadata and message ciphertexts.

## Prerequisites

Ensure you have the following installed before proceeding:
- [Node.js](https://nodejs.org/en/) (v16.14.0 or higher)
- [npm](https://www.npmjs.com/) (v8.0.0 or higher) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) (v5.0 or higher, running locally, or a MongoDB Atlas URI)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your environment:**
   Copy the example environment file and adjust it to your local setup.
   ```bash
   cp .env.example .env
   ```
   *(See [Environment Configuration](#environment-configuration) for details)*

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The server will bind to port `3000` (or the port specified in your `.env`) and watch for file changes using `nodemon`.

## Environment Configuration

Create a `.env` file in the root of the `backend` directory. 

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | The port the HTTP server will bind to | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/e2e_chat` |
| `JWT_SECRET` | Cryptographically secure string for signing JWTs | `a_secure_random_64_byte_string` |
| `CORS_ORIGIN` | The exact origin of the frontend application | `http://localhost:5173` |

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the development server with `ts-node` and `nodemon` for hot-reloading.
- `npm run build`: Compiles the TypeScript source code into JavaScript inside the `dist` directory.
- `npm start`: Runs the compiled production code from `dist/index.js`.
- `npm run lint`: Runs ESLint across the codebase to enforce style and catch errors.

## Project Structure

```text
backend/
├── src/
│   ├── config/       # Environment variables, database initialization, and constants
│   ├── controllers/  # HTTP request handlers parsing input and formatting responses
│   ├── dtos/         # Data Transfer Objects / TypeScript interfaces for request validation
│   ├── middleware/   # Express middleware (Auth, Error Handling, Validation)
│   ├── models/       # Mongoose Schemas (User, Conversation, Message)
│   ├── repositories/ # Abstraction layer for database queries
│   ├── routes/       # Express router definitions mapping paths to controllers
│   ├── services/     # Core business logic isolating controllers from DB operations
│   ├── utils/        # Utility functions (async wrappers, customized error classes)
│   ├── websocket/    # WebSocket connection logic and event dispatchers
│   └── index.ts      # Server bootstrap and middleware application
├── package.json      # Project metadata and dependencies
└── tsconfig.json     # TypeScript compiler configuration
```

## Architecture & Security

### REST & WebSocket Symbiosis
The HTTP server (Express) and the WebSocket server (`ws`) share the exact same underlying port and Node.js `http.Server` instance. Authentication for REST endpoints is handled via standard `Authorization: Bearer <token>` headers, while the WebSocket server authenticates connections via a `?token=<jwt>` query parameter during the upgrade handshake.

### Data Model (Zero-Knowledge)
To maintain E2E integrity, the `Message` schema explicitly omits any `plaintext` properties.
```typescript
interface IMessage {
  senderId: ObjectId;
  conversationId: ObjectId;
  encryptedContent: string; // AES-GCM Ciphertext
  iv: string;               // Initialization Vector
  authTag: string;          // Authentication Tag
  // ... timestamps and metadata
}
```

### WebSocket Event Matrix
The server routes the following events contextually to connected clients based on their authenticated user ID and active conversation memberships:

| Event | Direction | Purpose |
| :--- | :--- | :--- |
| `message:new` | Server → Client | Dispatches a newly persisted message payload. |
| `conversation:new` | Server → Client | Alerts the recipient of an initiated chat request. |
| `conversation:accepted` | Server → Client | Notifies the initiator that their request was accepted. |
| `user:typing` | Client ↔ Server | High-frequency relay for typing indicator states. |

## Contributing

We strictly enforce a layered architecture. When contributing, please ensure that HTTP-specific logic remains in `controllers`, business rules in `services`, and database interactions in `repositories`. Ensure `npm run build` succeeds and TypeScript compilation passes without errors before opening a Pull Request.
