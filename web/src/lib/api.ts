import type {
  ApiErrorResponse,
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

import type {
  CreateProjectPayload,
  ProjectCollectionResponse,
  ProjectResponse,
} from "@/types/project";

import type {
  CreateTaskPayload,
  TaskCollectionResponse,
  TaskResponse,
} from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getXsrfToken(): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("XSRF-TOKEN="));

  return cookie
    ? decodeURIComponent(cookie.substring("XSRF-TOKEN=".length))
    : undefined;
}

async function initializeCsrf(): Promise<void> {
  const response = await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      "Unable to initialize CSRF protection.",
      response.status,
    );
  }
}

async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers: customHeaders, ...init } = options;
  const method = init.method ?? "GET";
  const headers = new Headers(customHeaders);

  headers.set("Accept", "application/json");

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const xsrfToken = getXsrfToken();

    if (xsrfToken) {
      headers.set("X-XSRF-TOKEN", xsrfToken);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    method,
    credentials: "include",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ApiErrorResponse;

    throw new ApiError(
      error.message ?? "An unexpected error occurred.",
      response.status,
      error.errors ?? {},
    );
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  register(payload: RegisterPayload) {
    return initializeCsrf().then(() =>
      request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: payload,
      }),
    );
  },

  login(payload: LoginPayload) {
    return initializeCsrf().then(() =>
      request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: payload,
      }),
    );
  },

  me() {
    return request<{ user: AuthUser }>("/api/auth/me");
  },

  logout() {
    return initializeCsrf().then(() =>
      request<{ message: string }>("/api/auth/logout", {
        method: "POST",
      }),
    );
  },
};

export const projectApi = {
  list() {
    return request<ProjectCollectionResponse>("/api/projects");
  },

  show(projectId: number) {
    return request<ProjectResponse>(`/api/projects/${projectId}`);
  },

  create(payload: CreateProjectPayload) {
    return initializeCsrf().then(() =>
      request<ProjectResponse>("/api/projects", {
        method: "POST",
        body: payload,
      }),
    );
  },
};

export const taskApi = {
  list(projectId: number) {
    return request<TaskCollectionResponse>(
      `/api/projects/${projectId}/tasks`,
    );
  },

  create(projectId: number, payload: CreateTaskPayload) {
    return initializeCsrf().then(() =>
      request<TaskResponse>(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        body: payload,
      }),
    );
  },
};