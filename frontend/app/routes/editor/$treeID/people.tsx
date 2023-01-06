import { Box } from "@mui/material";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";

import { LoaderFunction, redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Node } from "src/client";
import { FieldSetTemplate, InputProps } from "~/client";
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
  const [tree, fields] = await Promise.all([
    api.trees.getDetailedTreeApiTreesTreeIdGet(treeID),
    api.fields.getMyFieldsetsApiFieldsMyGet(),
  ]);
  return json({ tree, fields });
};

export default function PeopleView() {
  const { tree, fields } = useLoaderData();
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
    }));
  const gridRows: GridRowsProp = tree.nodes.map((node: Node) => {
    const { id } = node;
    return {
      id,
    };
  });
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
        columns={gridColumns}
      />
    </Box>
  );
}

export const handle = "People View";
