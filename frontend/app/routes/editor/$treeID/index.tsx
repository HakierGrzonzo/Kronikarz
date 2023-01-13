import type { LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";
import { Network } from "vis-network";
import { useRef, useEffect } from "react";

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
  return <VisNetwork />;
}

export const handle = "Tree View";

const VisNetwork: React.FC = () => {
  const nodes = [
    { id: 1, label: "Node 1" },
    { id: 2, label: "Node 2" },
    { id: 3, label: "Node 3" },
    { id: 4, label: "Node 4" },
    { id: 5, label: "Node 5" },
  ];

  const edges = [
    { from: 1, to: 3 },
    { from: 1, to: 2 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 3 },
  ];

  const visJsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const network =
      visJsRef.current &&
      new Network(
        visJsRef.current,
        { nodes, edges },
        {
          autoResize: true,
          edges: {
            color: "#111",
          },
        }
      );
    network?.on("selectNode", (event: { nodes: string[] }) => {
      if (event.nodes?.length === 1) {
        window.location.href = event.nodes[0];
      }
    });
  }, [visJsRef, nodes, edges]);

  return (
    <div
      ref={visJsRef}
      style={{
        height: `90vh`,
        width: `100vw`,
      }}
    />
  );
};