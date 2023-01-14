import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";
import { LoaderFunction, redirect, Response } from "@remix-run/node";
export const loader: LoaderFunction = async ({ request }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const acceptFormats = request.headers.get("Accept") as string;
  const api = createApiClient(token, {
    HEADERS: {
      Accept: acceptFormats,
    },
  });
  const fileId = new URL(request.url).searchParams.get("id");
  if (!fileId) throw Error("No file id!");
  const widthString = new URL(request.url).searchParams.get("width");
  const width = widthString ? parseInt(widthString) : undefined;
  const heightString = new URL(request.url).searchParams.get("height");
  const height = heightString ? parseInt(heightString) : undefined;
  const response = (await api.files.getResizedPictureApiFilesPictureFileIdGet(
    fileId as string,
    height,
    width,
    acceptFormats
  )) as Response;
  return new Response(await response.blob(), {
    status: 200,
    headers: {
      ["Cache-Control"]: response.headers.get("Cache-Control") as string,
      ["Content-Type"]: response.headers.get("Content-Type") as string,
    },
  });
};
