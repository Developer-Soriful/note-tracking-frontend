import { env } from "../config/env";
import { tokenStorage } from "../auth/token-storage";
import type {
  ApiErrorIssue,
  ApiErrorResponse,
  ApiSuccessResponse,
} from "../../types/api";

/**
 * Custom application error representing backend API failure envelopes.
 */
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: ApiErrorIssue[];

  constructor(
    message: string,
    status: number,
    code: string = "API_ERROR",
    details?: ApiErrorIssue[],
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: QueryParams;
  skipAuth?: boolean;
}

type UnauthorizedHandler = () => void;

class ApiClient {
  private readonly baseUrl: string;
  private onUnauthorizedHandler: UnauthorizedHandler | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Registers a listener to invoke when an authenticated request is rejected with 401.
   */
  public setOnUnauthorized(handler: UnauthorizedHandler | null): void {
    this.onUnauthorizedHandler = handler;
  }

  /**
   * Clears the unauthorized handler if it matches the currently registered instance.
   */
  public clearOnUnauthorized(handler: UnauthorizedHandler): void {
    if (this.onUnauthorizedHandler === handler) {
      this.onUnauthorizedHandler = null;
    }
  }

  /**
   * Builds the full request URL with query parameters.
   */
  private buildUrl(endpoint: string, params?: QueryParams): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Core request dispatcher handling headers, fetch, status codes, and error envelopes.
   */
  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PATCH" | "DELETE",
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const {
      params,
      skipAuth = false,
      headers: customHeaders,
      signal,
      ...fetchOptions
    } = options;
    const url = this.buildUrl(endpoint, params);

    const headers = new Headers(customHeaders);

    // Set JSON content type for requests with a payload
    if (body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // Determine the exact Bearer token sent with this request
    let sentBearerToken: string | null = null;
    if (!skipAuth) {
      if (!headers.has("Authorization")) {
        const token = tokenStorage.getAccessToken();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
          sentBearerToken = token;
        }
      } else {
        const customAuth = headers.get("Authorization");
        const match = customAuth
          ? /^Bearer\s+(.+)$/i.exec(customAuth.trim())
          : null;
        if (match?.[1]) {
          sentBearerToken = match[1];
        }
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      });
    } catch (networkError) {
      if (networkError instanceof Error && networkError.name === "AbortError") {
        throw networkError;
      }
      const message =
        networkError instanceof Error
          ? networkError.message
          : "Network connection failed";
      throw new ApiClientError(message, 0, "NETWORK_ERROR");
    }

    // Handle 401 Unauthorized / Token Expiry ONLY when all conditions are satisfied:
    // 1. HTTP status is 401
    // 2. skipAuth is false
    // 3. Request actually sent a Bearer token
    // 4. The sent token strictly matches the current token in tokenStorage
    if (response.status === 401 && !skipAuth && sentBearerToken !== null) {
      const currentStoredToken = tokenStorage.getAccessToken();

      if (
        currentStoredToken !== null &&
        currentStoredToken === sentBearerToken
      ) {
        tokenStorage.clearAccessToken();

        // Prevent duplicate unauthorized notifications across concurrent 401 responses
        if (this.onUnauthorizedHandler) {
          this.onUnauthorizedHandler();
        }
      }
    }

    // Parse response body
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    let responseData: unknown = null;
    if (isJson) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    }

    if (!response.ok) {
      const errorEnvelope = responseData as Partial<ApiErrorResponse> | null;
      const message =
        errorEnvelope?.message || response.statusText || "Request failed";
      const code = errorEnvelope?.code || `HTTP_${response.status}`;
      const details = errorEnvelope?.details;

      throw new ApiClientError(message, response.status, code, details);
    }

    // If the response follows { success: true, message: string, data: T }
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      const envelope = responseData as ApiSuccessResponse<T>;
      return envelope.data;
    }

    return responseData as T;
  }

  /**
   * HTTP GET
   */
  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, "GET", undefined, options);
  }

  /**
   * HTTP POST
   */
  public post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, "POST", data, options);
  }

  /**
   * HTTP PATCH
   */
  public patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, "PATCH", data, options);
  }

  /**
   * HTTP DELETE
   */
  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, "DELETE", undefined, options);
  }
}

export const apiClient = new ApiClient(env.apiUrl);
