import { AppClient } from "./client";

export function createApiClient(token?: string): AppClient {
  return new AppClient({
    BASE: process.env.BACKEND ?? "http://localhost:8000",
    TOKEN: token,
  });
}
