export interface ChatAIConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  origin?: string;
  headers?: Record<string, string>;
}

export interface ChatOptions {
  sessionId?: string;
  stream?: boolean;
  // Future extensibility options
  model?: string;
  temperature?: number;
  maxTokens?: number;
  context?: string;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  query: string;
  stream: boolean;
  sessionId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  context?: string;
  metadata?: Record<string, any>;
}

export interface ChatResponse {
  error: boolean;
  sessionId: string;
  response: string;
  outOfContext?: boolean;
}

export interface ChatChunk {
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

export interface ChatAIError extends Error {
  status?: number;
  response?: any;
}

export class ChatAIError extends Error {
  constructor(message: string, public status?: number, public response?: any) {
    super(message);
    this.name = "ChatAIError";
  }
}
