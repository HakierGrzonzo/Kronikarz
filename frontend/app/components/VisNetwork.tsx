/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, useEffect } from "react";
import { Network } from "vis-network";
import type { AllNode } from "~/client";
import { useState } from "react";
import { randomAvatar } from "~/utils/image";
import { useFetcher } from "@remix-run/react";
import { Box, Typography } from "@mui/material";
import ModalForm from "./ModalForm";

export default function VisNetwork({
  data,
  treeID,
  token,
}: {
  data: AllNode[];
  treeID: string;
  token: string;
}) {
  const fetcher = useFetcher();
  if (!data || data.length === 0)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <Typography variant="h4">No data for this tree</Typography>
      </Box>
    );

  const nodes = data.map((node) => {
    return {
      id: node.node.id,
      label: `${node.node.name} ${node.node.surname}`,
      image: randomAvatar(node.node.id),
      shape: "circularImage",
    };
  });
  const edges = data.flatMap((node) => {
    return node.relations.map((relation) => {
      return {
        id: relation.id,
        from: node.node.id,
        to: relation.out.id,
        label: relation.relation_type,
      };
    });
  });
  const [current, setCurrent] = useState<any>(null);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
          interaction: { hover: true },
          manipulation: {
            enabled: true,
            addNode: false,
            deleteNode: function (data: any, callback: any) {
              callback(data);
              fetcher.submit(
                { treeID, nodeID: data.nodes[0], type: "deleteNode" },
                { method: "post", replace: true }
              );
            },
            editNode: function (data: any, callback: any) {
              window.location.href = `/editor/${treeID}/${data.id}`;
            },
            addEdge: function (data: any, callback: any) {
              setCurrent(data);
              handleOpen();
              callback(data);
            },
            deleteEdge: function (data: any, callback: any) {
              setCurrent(data);
              console.log(data);
              // find in edges data.edges[0]
              console.log(edges.find((edge) => edge.id === data.edges[0]));
              callback(data);
              // TODO: when backend is ready connect this
              // fetcher.submit(
              //   { treeID, nodeID: data.nodes[0], type: "deleteEdge" },
              //   { method: "post", replace: true }
              // );
            },
          },
        }
      );
    network?.on("oncontext", (event: any) => {
      event.event.preventDefault();
      if (event.nodes?.length === 1) {
        window.location.href = `/editor/${treeID}/${event.nodes[0]}`;
      }
    });
  }, [visJsRef, nodes, edges]);

  return (
    <>
      <ModalForm
        treeID={treeID}
        current={current}
        open={open}
        handleClose={handleClose}
      />
      <div
        ref={visJsRef}
        style={{
          height: `90vh`,
          width: `90vw`,
          margin: `auto`,
        }}
      />
    </>
  );
}
