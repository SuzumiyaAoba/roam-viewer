/**
 * Base API client with common functionality
 * Provides error handling, timeout management, and retry logic
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export abstract class BaseApiClient {
  protected baseUrl: string;
  protected timeout: number;
  protected abstract basePath: string;

  constructor(baseUrl: string = "http://localhost:3001", timeout: number = 30000) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.timeout = timeout;
    console.log(`📡 BaseApiClient initialized with baseUrl: ${this.baseUrl}`);
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${this.basePath}${endpoint}`;
    console.log(`🔍 BaseAPI Request: ${options.method || 'GET'} ${url}`);

    // Use longer timeout for POST/PUT operations (updates can be slow with Japanese text)
    const requestTimeout =
      options.method === "POST" || options.method === "PUT" ? 90000 : this.timeout;

    // Log slow operations for debugging
    if (options.method === "POST" || options.method === "PUT") {
      console.log(
        `🕐 Starting ${options.method} request to: ${url} (timeout: ${requestTimeout}ms)`,
      );
    }

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        // Try to extract error message from response body
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If we can't parse JSON, use the default HTTP status message
        }

        throw new ApiError(errorMessage, response.status, response);
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if ((error as Error).name === "AbortError") {
        throw new ApiError(
          `Request timeout: The operation took longer than ${requestTimeout}ms to complete`,
          408,
        );
      }

      throw new ApiError(`Network error: ${(error as Error).message}`, 0);
    }
  }

  /**
   * GET request helper
   */
  protected get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * POST request helper
   */
  protected post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request helper
   */
  protected put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request helper
   */
  protected delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
