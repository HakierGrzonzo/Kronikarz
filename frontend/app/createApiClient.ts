import { AppClient, OpenAPIConfig } from "./client";
import type { JwtPayload } from "jsonwebtoken";
import { decode } from "jsonwebtoken";
import { isPast, millisecondsInSecond } from "date-fns";
import { redirect } from "@remix-run/node";
import { cookieMaker, deleteCookie } from "./utils/cookieUtils";

export function createApiClient(
  token?: string,
  extra?: Partial<OpenAPIConfig>
): AppClient {
  if (token) {
    const payload = decode(token, { complete: true })?.payload as JwtPayload;
    const expiryDate = new Date(millisecondsInSecond * (payload.exp as number));
    if (isPast(expiryDate)) {
      throw redirect("/logout", {
        headers: cookieMaker([deleteCookie("token")]),
      });
    }
  }
  return new AppClient({
    BASE: process.env.BACKEND ?? "http://localhost:8000",
    TOKEN: token,
    ...extra,
  });
}
