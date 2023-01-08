import {
  Accordion,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  IconButton,
  Modal,
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
import {
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import { Delete, ExpandMore } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Loader from "~/components/Loader";

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
  const [currentlyDeletedField, setCurrentlyDeletedField] = useState<
    FieldSetTemplate | undefined
  >(undefined);
  const lastDeletedField = useActionData();
  useEffect(() => setCurrentlyDeletedField(undefined), [lastDeletedField]);
  const transition = useTransition();
  return (
    <>
      <Modal open={!!currentlyDeletedField}>
        <Alert
          severity="error"
          variant="filled"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: 1,
          }}
        >
          <AlertTitle>Are you sure?</AlertTitle>
          <Typography>
            You are about to delete field set{" "}
            <em>{currentlyDeletedField?.name}</em>. This action will also delete{" "}
            <strong>All Data Stored In Those Fields!</strong>
          </Typography>
          {transition.state === "submitting" ? (
            <Loader />
          ) : (
            <Stack direction="row" spacing={2} sx={{ paddingTop: 2 }}>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => setCurrentlyDeletedField(undefined)}
              >
                Cancel
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() =>
                  submit(
                    { id: currentlyDeletedField?.id as string },
                    { replace: true, method: "post" }
                  )
                }
              >
                Delete
              </Button>
            </Stack>
          )}
        </Alert>
      </Modal>
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
                  onClick={(e) => {
                    setCurrentlyDeletedField(set);
                    e.stopPropagation();
                  }}
                >
                  <Delete />
                </IconButton>
              </AccordionSummary>
            </Accordion>
          ))}
        </Stack>
      </Stack>
    </>
  );
}

export const handle = "My Field Sets";
