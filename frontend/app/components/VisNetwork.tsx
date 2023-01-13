/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, useEffect } from "react";
import { Network } from "vis-network";
import type { AllNode } from "~/client";

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

    const edges = [
        { from: 1, to: 3 },
        // { from: 1, to: 2 },
        // { from: 2, to: 4 },
        // { from: 2, to: 5 },
        // { from: 3, to: 3 },
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