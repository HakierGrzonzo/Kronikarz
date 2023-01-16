import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";
import { LoaderFunction, redirect, Response } from "@remix-run/node";
export const loader: LoaderFunction = async ({ request }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const fileId = new URL(request.url).searchParams.get("id");
  if (!fileId) throw Error("No file id!");
  const response = (await api.files.getFileWithIdApiFilesGetFileIdGet(
    fileId as string
  )) as Response;
  return new Response(await response.blob(), {
    status: 200,
    headers: {
      ["Cache-Control"]: response.headers.get("Cache-Control") as string,
      ["Content-Type"]: response.headers.get("Content-Type") as string,
    },
  });
};
