import axios, { AxiosError } from 'axios';
import { getEnv } from './utils';

const API_URL = getEnv('VITE_API_URL', '/api/v1');

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
  error?: { code: string; message: string; details?: unknown };
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    return data?.error?.message || error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export function unwrapPaginated<T>(response: { data: ApiResponse<T[]> }): PaginatedResponse<T> {
  const { data, meta } = response.data;
  return {
    items: data,
    meta: meta ?? { page: 1, limit: 20, total: data.length, totalPages: 1 },
  };
}

export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}
