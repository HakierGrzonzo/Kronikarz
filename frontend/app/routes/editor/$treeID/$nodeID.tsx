import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  Box,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  TextField,
  IconButton,
} from "@mui/material";

import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";
import { useEffect, useState } from "react";
import type { FieldSetTemplate, NodeValues, RawNodeValues } from "~/client";
import { Delete, ExpandMore } from "@mui/icons-material";
import Feedback from "~/components/Feedback";

export const loader: LoaderFunction = async ({ request, params }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const { treeID, nodeID } = params;
  if (treeID === undefined) throw Error("treeID not given");
  if (nodeID === undefined) throw Error("nodeID not given");

  const dateRegex = new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$");

  const valuesResp =
    await api.nodes.getValuesForNodeApiNodesValuesTreeIdNodeIdGet(
      treeID,
      nodeID
    );

  const baseResp = await api.nodes.getOneNodeApiNodesTreeIdNodeIdGet(
    treeID,
    nodeID
  );

  const data = valuesResp.map((node) => {
    return {
      values: node.values.map((value) => {
        if (dateRegex.test(value)) {
          return value.toString().split("T")[0];
        }
        return value;
      }),
      in: node.in,
      out: node.out,
      id: node.id,
    };
  });

  const fields = await api.fields.getMyFieldsetsApiFieldsMyGet();
  return json([baseResp, data, fields]);
};

export const action: ActionFunction = async ({ request, params }) => {
  const data = await request.formData();
  const values: Record<string, RawNodeValues> = {};
  for (const key of data.keys()) {
    if (key.startsWith("base")) continue;
    const [fieldSet, index] = key.split("-");
    const arr = values[fieldSet] || { values: [] };
    const value = data.get(key);
    arr.values[parseInt(index)] = value as string;
    values[fieldSet] = arr;
  }
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const { treeID, nodeID } = params;
  if (!treeID) throw Error("treeID not given");
  if (!nodeID) throw Error("nodeID not given");
  const name = data.get("base-name") as string;
  const surname = data.get("base-surname") as string;
  const result = await api.nodes.editNodeApiNodesTreeIdNodeIdPost(
    treeID,
    nodeID,
    {
      name,
      surname,
    }
  );

  await Promise.all(
    Object.entries(values).map(([key, value]) => {
      api.nodes.editNodeValuesApiNodesTreeIdNodeIdFieldSetIdPost(
        treeID,
        nodeID,
        key,
        value
      );
    })
  );
  return json(result);
};

export default function EditPerson() {
  const [baseResp, data, fields] =
    useLoaderData<[Node, NodeValues[], FieldSetTemplate[]]>();
  const allCurrentFieldSets = data.map((d) => d.out?.id);
  const [fieldSetToAdd, setFieldSetToAdd] = useState<string>("no-value");
  const [selectedFields, setFields] = useState<string[]>(allCurrentFieldSets);
  const getCurrentValuesForFieldSet = (fieldSetId: string) =>
    data.find((d) => d.out?.id === fieldSetId)?.values;
  useEffect(() => {
    // When the selectedFields changes, we reset the select
    setFieldSetToAdd("no-value");
  }, [selectedFields]);
  const lastPerson = useActionData();

  return (
    <Box sx={{ padding: 1, width: "100%" }}>
      {lastPerson && (
        <Feedback
          msg={`Succesfully added ${lastPerson.name}!`}
          severity="success"
        />
      )}
      <Typography variant="h3">Edit person</Typography>
      <Form replace method="post">
        <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap" }}>
          <TextField
            name="base-name"
            label="Name"
            defaultValue={baseResp.name}
            required
          />
          <TextField
            name="base-surname"
            label="Surname"
            defaultValue={baseResp.surname}
            required
          />
        </Stack>
        {selectedFields
          .map((fieldSetId) => fields.find((f) => f.id === fieldSetId))
          .map(
            (fieldSet) =>
              fieldSet && (
                <Accordion key={fieldSet.id}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography sx={{ flex: 1 }} variant="h6">
                      {fieldSet.name}
                    </Typography>
                    <IconButton
                      onClick={() =>
                        setFields(
                          selectedFields.filter((set) => set !== fieldSet.id)
                        )
                      }
                    >
                      <Delete />
                    </IconButton>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap" }}>
                      {fieldSet.fields.map((field, index) => (
                        <TextField
                          key={index}
                          label={field.type == "date" ? undefined : field.name}
                          type={field.type}
                          name={`${fieldSet.id}-${index}`}
                          required={field.required}
                          defaultValue={
                            getCurrentValuesForFieldSet(fieldSet.id)?.[index]
                          }
                        />
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )
          )}
        <Button type="submit" variant="contained" sx={{ marginTop: 1 }}>
          Save changes
        </Button>
      </Form>
      <Divider sx={{ marginBlock: 2, width: "100%" }} />
      <Stack direction="row" spacing={2} sx={{ maxWidth: "15cm" }}>
        <FormControl fullWidth>
          <InputLabel id="field-set-selector">Add new field set</InputLabel>
          <Select
            labelId="field-set-selector"
            id="currentlySelectedFieldSet"
            label="Add new field set"
            value={fieldSetToAdd}
            onChange={(e) => setFieldSetToAdd(e.target.value)}
          >
            <MenuItem value="no-value">Select fields to add</MenuItem>
            {fields
              .filter((field) => !selectedFields.includes(field.id))
              .map((field) => (
                <MenuItem key={field.id} value={field.id}>
                  {field.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          disabled={fieldSetToAdd === "no-value"}
          onClick={() => {
            setFields([...selectedFields, fieldSetToAdd]);
          }}
        >
          Add
        </Button>
      </Stack>
    </Box>
  );
}
