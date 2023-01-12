import { LoaderFunction, redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";

export const loader: LoaderFunction = async ({ request, params }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const { treeID } = params;
  if (treeID === undefined) throw Error("treeID not given");
  const tree = await api.trees.getDetailedTreeApiTreesTreeIdGet(treeID);
  return json(tree);
};

export default function TreeView() {
  const tree = useLoaderData();
  return `here be tree: ${tree.name}`;
}

export const handle = "Tree View";
