import type { LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";
import type { AllNode } from "~/client";
import VisNetwork from "~/components/VisNetwork";

export const loader: LoaderFunction = async ({ request, params }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const { treeID } = params;
  if (treeID === undefined) throw Error("treeID not given");
  const data = await api.nodes.getAllValuesAndRelationsInTreeApiNodesTreeIdValuesGet(
    treeID
  );
  return json(data);
};

export default function TreeView() {
  const data = useLoaderData() as AllNode[];
  return <VisNetwork data={data} />;
}

export const handle = "Tree View";
