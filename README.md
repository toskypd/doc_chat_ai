# doc_chat_ai

A simple and efficient backend SDK for communicating with the ChatAI API. This SDK provides easy-to-use methods for both streaming and non-streaming chat interactions.

## Installation

```bash
npm install doc_chat_ai
```

## Quick Start

```javascript
const { ChatAIClient } = require("doc_chat_ai");

const client = new ChatAIClient({
  apiKey: "your-api-key-here",
  baseUrl: "https://your-backend.com", // optional, defaults to localhost:3001
});

// Simple chat
const response = await client.chat("What is machine learning?");
console.log(response.response);
```

## Features

- ✅ **Simple API** - Easy to use with minimal configuration
- ✅ **Streaming Support** - Real-time streaming responses with Server-Sent Events
- ✅ **Session Management** - Maintain conversation context across requests
- ✅ **CORS Support** - Configurable headers for cross-origin requests
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Error Handling** - Comprehensive error handling with detailed messages
- ✅ **Custom Headers** - Support for additional HTTP headers

## Usage Examples

### Basic Chat (Non-Streaming)

```javascript
const { ChatAIClient } = require("doc_chat_ai");

const client = new ChatAIClient({
  apiKey: "your-api-key",
  baseUrl: "https://your-backend.com",
});

async function basicChat() {
  try {
    const response = await client.chat("What is artificial intelligence?");
    console.log("AI Response:", response.response);
    console.log("Session ID:", response.sessionId);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

basicChat();
```

### Streaming Chat

```javascript
const { ChatAIClient } = require("doc_chat_ai");

const client = new ChatAIClient({
  apiKey: "your-api-key",
});

async function streamingChat() {
  try {
    const stream = await client.chatStream("Explain deep learning in detail");

    for await (const chunk of stream) {
      if (chunk.type === "content") {
        process.stdout.write(chunk.content); // Print streaming content
      }
      if (chunk.type === "done") {
        console.log("\n[Stream complete]");
      }
    }
  } catch (error) {
    console.error("Streaming error:", error.message);
  }
}

streamingChat();
```

### Session Management

```javascript
const client = new ChatAIClient({
  apiKey: "your-api-key",
});

async function conversation() {
  const sessionId = "user-session-123";

  // First message
  const response1 = await client.chat("Hello, my name is John", {
    sessionId: sessionId,
  });
  console.log("AI:", response1.response);

  // Follow-up message (AI will remember the conversation)
  const response2 = await client.chat("What is my name?", {
    sessionId: sessionId,
  });
  console.log("AI:", response2.response);
}
```

### Custom Headers and CORS

```javascript
const client = new ChatAIClient({
  apiKey: "your-api-key",
  origin: "https://my-frontend.com",
  headers: {
    "X-Request-ID": "abc123",
    "X-Client-Version": "1.0.0",
  },
});
```

### Advanced Options

```javascript
// Chat with advanced parameters
const response = await client.chat("Explain quantum computing", {
  sessionId: "user-session-123",
  model: "gpt-4",
  temperature: 0.7,
  maxTokens: 1000,
  context: "User is a beginner in physics",
  metadata: {
    userId: "user-123",
    source: "web-app",
    timestamp: new Date().toISOString(),
  },
});
```

### Error Handling

```javascript
try {
  const response = await client.chat("Tell me about AI");
  console.log(response.response);
} catch (error) {
  if (error.status) {
    console.error(`API Error ${error.status}:`, error.message);
  } else {
    console.error("Network Error:", error.message);
  }
}
```

## API Reference

### ChatAIClient

#### Constructor

```javascript
new ChatAIClient(config);
```

**Config Options:**

- `apiKey` (required): Your ChatAI API key
- `baseUrl` (optional): Base URL for the API (default: `http://localhost:3002`)
- `timeout` (optional): Request timeout in milliseconds (default: `30000`)
- `origin` (optional): Origin header for CORS (default: `*`)
- `headers` (optional): Additional custom headers

#### Methods

##### `chat(query, options)`

Send a chat message and get a complete response.

**Parameters:**

- `query` (string): The message to send
- `options` (object, optional):
  - `sessionId` (string, optional): Session ID for conversation continuity
  - `stream` (boolean, optional): Force non-streaming mode (default: `false`)

**Returns:** Promise<ChatResponse>

##### `chatStream(query, options)`

Send a chat message and get a streaming response.

**Parameters:**

- `query` (string): The message to send
- `options` (object, optional):
  - `sessionId` (string, optional): Session ID for conversation continuity

**Returns:** AsyncGenerator<ChatChunk>

### Types

#### ChatResponse

```typescript
interface ChatResponse {
  error: boolean;
  sessionId: string;
  response: string;
  outOfContext?: boolean;
}
```

#### ChatChunk

```typescript
interface ChatChunk {
  type: "session" | "content" | "done" | "error";
  sessionId?: string;
  content?: string;
  timestamp?: string;
  timing?: {
    total: number;
  };
  outOfContext?: boolean;
  message?: string;
}
```

## Backend API Endpoint

This SDK communicates with the ChatAI backend endpoint:

```
POST /api/v1/chat
Content-Type: application/json
Authorization: Bearer {API_KEY}

{
  "query": "User's question/query",
  "stream": true,
  "sessionId": "optional-session-id",
  "model": "optional-model-name",
  "temperature": 0.7,
  "maxTokens": 1000,
  "context": "optional-context",
  "metadata": { "custom": "data" }
}

Parameters:
- query (required): User's question/query
- stream (required): true for streaming response, false for complete response
- sessionId (optional): Session ID for conversation continuity
- model (optional): AI model to use
- temperature (optional): Response creativity (0.0-1.0)
- maxTokens (optional): Maximum response length
- context (optional): Additional context for the query
- metadata (optional): Custom metadata object
```

## License

MIT
