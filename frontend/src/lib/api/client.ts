// src/lib/api/client.ts
// Base API client configuration

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'An error occurred',
    }));

    throw new ApiError(
      error.error || error.message || 'Request failed',
      response.status,
      error.details
    );
  }

  return response.json();
}

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },
};
