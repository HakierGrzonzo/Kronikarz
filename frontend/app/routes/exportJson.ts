import { json, LoaderFunction, redirect } from "@remix-run/node";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";

export const loader: LoaderFunction = async ({ request }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const url = new URL(request.url);
  const treeID = url.searchParams.get("treeID");
  if (!treeID) throw Error("No treeID given");
  const data =
    await api.nodes.getAllValuesAndRelationsInTreeApiNodesTreeIdValuesGet(
      treeID
    );
  return json(data);
};
