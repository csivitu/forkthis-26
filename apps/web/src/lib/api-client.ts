import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 15_000,
});

export function apiErrorMessage(error: Error): string {
  if (axios.isAxiosError<{ error?: { code: string; message: string } }>(error)) {
    const failure = error.response?.data.error;
    if (failure) return `${failure.code}: ${failure.message}`;
  }
  return error.message;
}
