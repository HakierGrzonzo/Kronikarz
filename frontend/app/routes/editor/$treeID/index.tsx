import type { ActionFunction, LoaderFunction } from "@remix-run/node";
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
  const data =
    await api.nodes.getAllValuesAndRelationsInTreeApiNodesTreeIdValuesGet(
      treeID
    );
  return json([data, treeID, token]);
};

export const action: ActionFunction = async ({ request, params }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const data = await request.formData();
  if (data.get("type") === "deleteNode") {
    const treeID = data.get("treeID") as string;
    const nodeID = data.get("nodeID") as string;
    if (!treeID) throw Error("treeID not given");
    if (!nodeID) throw Error("nodeID not given");
    await api.nodes.deleteNodeApiNodesTreeIdNodeIdDeletePost(treeID, nodeID);
    return "success";
  }
  if (data.get("type") === "addEdge") {
    const treeID = data.get("treeID") as string;
    const from = data.get("from") as string;
    const to = data.get("to") as string;
    const label = data.get("label") as string;
    const startDate = data.get("startDate") as string;
    const endDate = data.get("endDate") as string;
    if (!treeID) throw Error("treeID not given");
    if (!from) throw Error("from not given");
    if (!to) throw Error("to not given");
    await api.nodes.linkNodesApiNodesRelationTreeIdLinkInNodeIdOutNodeIdPost(
      treeID,
      from,
      to,
      label,
      {
        start_date: startDate,
        end_date: endDate,
      }
    );
    return "success";
  }
  // TODO: implement when backend is ready
  // if (data.get("type") === "deleteEdge") {
  //   const treeID = data.get("treeID") as string;
  //   const from = data.get("from") as string;
  //   const to = data.get("to") as string;
  //   if (!treeID) throw Error("treeID not given");
  //   if (!from) throw Error("from not given");
  //   if (!to) throw Error("to not given");
  //   await api.nodes.de(treeID, from, to);
  //   return "success";
  // }
};

export default function TreeView() {
  const [data, treeID, token] = useLoaderData() as [AllNode[], string, string];
  return <VisNetwork data={data} treeID={treeID} token={token} />;
}

export const handle = "Tree View";
