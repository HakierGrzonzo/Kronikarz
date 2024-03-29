import { Box } from "@mui/material";
import type { GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import type { LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { Node } from "src/client";
import type { FieldSetTemplate, InputProps, NodeValues } from "~/client";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";

const dateRegex = new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$");

export const loader: LoaderFunction = async ({ request, params }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const { treeID } = params;
  if (treeID === undefined) throw Error("treeID not given");
  const [tree, fields] = await Promise.all([
    api.trees.getDetailedTreeApiTreesTreeIdGet(treeID),
    api.fields.getMyFieldsetsApiFieldsMyGet(),
  ]);
  const values = await Promise.all(
    tree.nodes.map(async (node) => {
      const value =
        await api.nodes.getValuesForNodeApiNodesValuesTreeIdNodeIdGet(
          treeID,
          (node as unknown as Node).id
        );
      return { node, value };
    })
  );
  return json({ fields, values });
};

const base_columns: GridColDef[] = [
  {
    field: "name",
  },
  {
    field: "surname",
  },
];

export default function PeopleView() {
  const { fields, values } = useLoaderData();
  const gridColumns: GridColDef[] = fields
    .flatMap((fieldSet: FieldSetTemplate) =>
      fieldSet.fields.map((field, index) => ({
        ...field,
        set: fieldSet,
        index,
      }))
    )
    .map((field: InputProps & { set: FieldSetTemplate; index: number }) => ({
      field: `${field.set.id}-${field.index}`,
      headerName: field.name,
      width: 150,
    }));
  const gridRows: GridRowsProp = values.map(
    (nodeAndValues: { node: Node; value: NodeValues[] }) => {
      const { node, value } = nodeAndValues;
      return {
        id: node.id,
        name: node.name,
        surname: node.surname,
        ...Object.fromEntries(
          value.flatMap((nodeValue) => {
            return nodeValue.values.map((v, index) => [
              `${nodeValue.out.id}-${index}`,
              dateRegex.test(v.toString()) ? v.toString().split("T")[0] : v,
            ]);
          })
        ),
      };
    }
  );
  const columnGrouping = fields.map((fieldSet: FieldSetTemplate) => ({
    groupId: fieldSet.id,
    headerName: fieldSet.name,
    children: fieldSet.fields.map((_, index) => ({
      field: `${fieldSet.id}-${index}`,
    })),
  }));
  return (
    <Box sx={{ padding: 1, width: "100%" }}>
      <DataGrid
        experimentalFeatures={{ columnGrouping: true }}
        columnGroupingModel={columnGrouping}
        rows={gridRows}
        columns={[...base_columns, ...gridColumns]}
      />
    </Box>
  );
}

export const handle = "People View";
