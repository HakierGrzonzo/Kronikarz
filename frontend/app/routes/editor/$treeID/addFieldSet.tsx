import { Add, Delete, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import type { FieldSetTemplate, InputProps } from "~/client";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";

function FieldForm(props: { index: number; onDelete: () => void }) {
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<string>("text");
  const { index, onDelete } = props;
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          {name || "New Field"}
        </Typography>
        <IconButton onClick={onDelete}>
          <Delete />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails>
        <Stack
          direction="row"
          sx={{ gap: 2, flexWrap: "wrap" }}
          alignItems="baseline"
        >
          <TextField
            required
            name={`${index}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            label="Field Name"
          />
          <FormControl sx={{ width: "7cm" }}>
            <InputLabel id={`${index}-field-type-select`}>
              Field type
            </InputLabel>
            <Select
              labelId={`${index}-field-type-select`}
              value={type}
              onChange={(e) => setType(e.target.value)}
              label="Field type"
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="number">Number</MenuItem>
            </Select>
            {/* This is a hack to make this fancy select work as a
             * normal <input/>
             */}
            <input
              type="text"
              name={`${index}-type`}
              value={type}
              readOnly
              style={{ visibility: "hidden" }}
            />
          </FormControl>
          <FormControlLabel
            control={<Checkbox name={`${index}-required`} />}
            label="Required"
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export const action: ActionFunction = async ({ request, params }) => {
  const data = await request.formData();
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  // Get indexes of fields in the form
  const fieldKeys = [...data.keys()]
    .filter((key) => key.endsWith("-type"))
    .map((key) => key.split("-")[0]);
  // extract field definitions for every index
  if (fieldKeys.length === 0) throw Error("No fields defined");
  const values: InputProps[] = fieldKeys.map((key) => {
    const name = data.get(`${key}-name`) as string | null;
    const type = data.get(`${key}-type`) as "date" | "text" | null;
    if (!name || !type) throw Error(`Missing properties on index ${key}`);
    return {
      name,
      type,
      required: false,
    } as InputProps;
  });
  const api = createApiClient(token);
  const { treeID } = params;
  if (treeID === undefined) throw Error("treeID not given");
  const fieldSetName = data.get("field-set-name");
  if (!fieldSetName) throw Error("Field set name not given");
  const result = await api.fields.createFieldSetTemplateApiFieldsCreatePost(
    fieldSetName as string,
    values
  );
  return json(result);
};

export default function AddFieldSet() {
  const [fields, setFields] = useState<(1 | undefined)[]>([]);
  const lastAddedFieldSet = useActionData() as null | FieldSetTemplate;
  return (
    <Box sx={{ padding: 1 }}>
      <Form reloadDocument method="post">
        <Stack spacing={2} alignItems="flex-start">
          {!!lastAddedFieldSet && (
            <Alert severity="success">
              Succesfully added field set <em>{lastAddedFieldSet.name}</em>
            </Alert>
          )}
          <Typography variant="h3">Create a new Field Set</Typography>
          <TextField required name="field-set-name" label="Field set name" />
        </Stack>
        <Box sx={{ paddingBlock: 2 }}>
          {fields.map(
            (displayAccordion, index) =>
              displayAccordion && (
                <FieldForm
                  index={index}
                  key={index}
                  onDelete={() => {
                    const newFields = [...fields];
                    newFields[index] = undefined;
                    setFields(newFields);
                  }}
                />
              )
          )}
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            endIcon={<Add />}
            onClick={() => setFields([...fields, 1])}
          >
            Add new field
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={fields.filter((f) => !!f).length === 0}
          >
            Create
          </Button>
        </Stack>
      </Form>
    </Box>
  );
}

export const handle = "Create new Field set";
