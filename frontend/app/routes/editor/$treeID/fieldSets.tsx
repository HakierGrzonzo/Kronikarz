import {
  Accordion,
  AccordionSummary,
  Box,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { getCookie } from "~/utils/cookieUtils";
import { createApiClient } from "~/createApiClient";

import {
  LoaderFunction,
  redirect,
  json,
  ActionFunction,
} from "@remix-run/node";
import { FieldSetTemplate } from "~/client";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Delete, ExpandMore } from "@mui/icons-material";

export const loader: LoaderFunction = async ({ request }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const fieldSets = await api.fields.getMyFieldsetsApiFieldsMyGet();
  return json(fieldSets);
};

export const action: ActionFunction = async ({ request }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const data = await request.formData();
  const id = data.get("id");
  if (!id) throw Error("ID not given!");
  api.fields.deleteFieldSetTemplateApiFieldsDeletePost(id as string);
  return id;
};

export default function FieldSets() {
  const fieldSets: FieldSetTemplate[] = useLoaderData();
  const submit = useSubmit();
  return (
    <Stack sx={{ padding: 1 }} spacing={2} alignItems="flex-start">
      <Typography variant="h3">My Field Sets</Typography>
      <Stack sx={{ minWidth: "15cm" }}>
        {fieldSets.map((set) => (
          <Accordion key={set.id}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={{ flex: 1 }} variant="h6">
                {set.name}
              </Typography>
              <IconButton
                onClick={() =>
                  submit({ id: set.id }, { method: "post", replace: true })
                }
              >
                <Delete />
              </IconButton>
            </AccordionSummary>
          </Accordion>
        ))}
      </Stack>
    </Stack>
  );
}

export const handle = "My Field Sets";
