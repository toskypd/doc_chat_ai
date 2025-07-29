import fetch from "node-fetch";
import {
  ChatAIConfig,
  ChatOptions,
  ChatRequest,
  ChatResponse,
  ChatChunk,
  ChatAIError,
} from "./types";

export class ChatAIClient {
  private apiKey: string;
  private timeout: number;
  private origin: string;
  private customHeaders: Record<string, string>;

  constructor(config: ChatAIConfig) {
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
    this.origin = config.origin || "*";
    this.customHeaders = config.headers || {};

    if (!this.apiKey) {
      throw new ChatAIError("API key is required");
    }
  }

  /**
   * Send a chat message and get a complete response
   */
  async chat(query: string, options: ChatOptions = {}): Promise<ChatResponse> {
    const requestBody: ChatRequest = {
      apikey: this.apiKey,
      query: query,
      stream: false,
      ...(options.sessionId && { sessionId: options.sessionId }),
      ...(options.model && { model: options.model }),
      ...(options.temperature !== undefined && {
        temperature: options.temperature,
      }),
      ...(options.maxTokens && { maxTokens: options.maxTokens }),
      ...(options.context && { context: options.context }),
      ...(options.metadata && { metadata: options.metadata }),
    };

    const url = `https://chatai.abstraxn.com/api/v1/chat/?apikey=${this.apiKey}`;
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: this.origin,
      ...this.customHeaders,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
        timeout: this.timeout,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ChatAIError(
          `API request failed: ${response.status} - ${errorText}`,
          response.status,
          errorText
        );
      }

      const data = (await response.json()) as ChatResponse;

      if (data.error) {
        throw new ChatAIError(
          `API returned error: ${data.response || "Unknown error"}`
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ChatAIError) {
        throw error;
      }
      throw new ChatAIError(
        `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Send a chat message and get a streaming response
   */
  async *chatStream(
    query: string,
    options: ChatOptions = {}
  ): AsyncGenerator<ChatChunk> {
    const requestBody: ChatRequest = {
      apikey: this.apiKey,
      query: query,
      stream: true,
      ...(options.sessionId && { sessionId: options.sessionId }),
      ...(options.model && { model: options.model }),
      ...(options.temperature !== undefined && {
        temperature: options.temperature,
      }),
      ...(options.maxTokens && { maxTokens: options.maxTokens }),
      ...(options.context && { context: options.context }),
      ...(options.metadata && { metadata: options.metadata }),
    };

    const url = `https://chatai.abstraxn.com/api/v1/chat/?apikey=${this.apiKey}`;
    const headers = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      Origin: this.origin,
      ...this.customHeaders,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
        timeout: this.timeout,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ChatAIError(
          `API request failed: ${response.status} - ${errorText}`,
          response.status,
          errorText
        );
      }

      if (!response.body) {
        throw new ChatAIError("No response body received");
      }

      yield* this.parseSSE(response.body);
    } catch (error) {
      if (error instanceof ChatAIError) {
        throw error;
      }
      throw new ChatAIError(
        `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Parse Server-Sent Events (SSE) stream
   */
  private async *parseSSE(
    body: NodeJS.ReadableStream
  ): AsyncGenerator<ChatChunk> {
    const decoder = new TextDecoder();
    let buffer = "";

    for await (const chunk of body) {
      buffer += decoder.decode(chunk as Buffer, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data) {
            try {
              const parsed = JSON.parse(data) as ChatChunk;
              yield parsed;
            } catch (e) {
              // Skip malformed JSON
              console.warn("Failed to parse SSE data:", data);
            }
          }
        }
      }
    }

    // Process any remaining data in buffer
    if (buffer.trim()) {
      const lines = buffer.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data) {
            try {
              const parsed = JSON.parse(data) as ChatChunk;
              yield parsed;
            } catch (e) {
              console.warn("Failed to parse SSE data:", data);
            }
          }
        }
      }
    }
  }

  /**
   * Get client configuration (for debugging)
   */
  getConfig(): Omit<ChatAIConfig, "apiKey"> {
    return {
      timeout: this.timeout,
      origin: this.origin,
      headers: { ...this.customHeaders },
    };
  }
}
