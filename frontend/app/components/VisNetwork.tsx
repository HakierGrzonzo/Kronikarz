/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, useEffect } from "react";
import { Network } from "vis-network";
import type { AllNode } from "~/client";
import { useState } from "react";

function EditEdgeWithoutDrag({
  shouldDisplay,
  data,
  cancel,
  callback,
}: {
  shouldDisplay: boolean;
  data?: any;
  cancel?: any;
  callback?: any;
}) {
  console.log(shouldDisplay);
  if (!shouldDisplay) return null;
  const [edgeData, setEdgeData] = useState(data);
  console.log(data);
  console.log("test");
  const handleSubmit = (e: any) => {
    e.preventDefault();
    callback(edgeData);
    cancel();
  };

  const handleInputChange = (e: any) => {
    setEdgeData({
      ...edgeData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Label:
        <input
          type="text"
          name="label"
          value={edgeData.label}
          onChange={handleInputChange}
        />
      </label>
      <br />
      <button type="submit">Save</button>
      <button onClick={cancel}>Cancel</button>
    </form>
  );
}

const img = (id: string) =>
  `https://source.boringavatars.com/beam/120/${id.substring(6, 14)}`;

export default function VisNetwork({ data }: { data: AllNode[] }) {
  if (!data) return null;

  const nodes = data.map((node) => {
    return {
      id: node.node.id,
      label: node.values[0].values[0] || node.node.id,
      image: img(node.node.id),
      shape: "circularImage",
    };
  });
  const edges = data.flatMap((node) => {
    return node.relations.map((relation) => {
      return {
        from: node.node.id,
        to: relation.out.id,
        label: relation.relation_type,
      };
    });
  });
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<any>(null);

  const clearNodePopUp = () => {
    setIsEditing(false);
  };

  const cancelNodeEdit = () => {
    setIsEditing(false);
    // additional logic to revert changes or reset data
  };

  const clearEdgePopUp = () => {
    setIsEditing(false);
  };

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
            deleteNode: function (data: any, callback: any) {
              console.log("delete node");
              console.log(data);
              callback(data);
            },
            // addNode: function (data: any, callback: any) {
            //     editNode(data, clearNodePopUp, callback);
            // },
            // editNode: function (data: any, callback: any) {
            //     setIsEditing(true);
            //     setCurrent(data);
            //     console.log("edit edge");
            // },
            // addEdge: true,
            // editEdge: function (data: any, callback: any) {
            //     setIsEditing(true);
            //     setCurrent(data);
            //     console.log("edit edge");
            // },
            // deleteNode: true,
            // deleteEdge: true,
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
    <>
      <EditEdgeWithoutDrag
        shouldDisplay={isEditing}
        data={current}
        callback={() => console.log("test")}
        cancel={cancelNodeEdit}
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
