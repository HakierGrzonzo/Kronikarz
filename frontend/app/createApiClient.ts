import { AppClient } from "./client";


export function createApiClient(token?: string): AppClient {
    return new AppClient({
        BASE: "http://localhost:8000",
        TOKEN: token,
    });
}