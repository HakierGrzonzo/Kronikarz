import {
  Typography,
  Stack,
  CircularProgress,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { ActionFunction, redirect, MetaFunction, json } from "@remix-run/node";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";
import { Form, useTransition, Link, useActionData } from "@remix-run/react";

export const action: ActionFunction = async ({ request }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const formData = await request.formData();
  const treeName = formData.get("treeName");
  if (treeName === null || treeName === "") {
    return json("Can't create a tree with no name");
  }
  await api.trees.createNewTreeApiTreesNewPost(treeName as string);
  return redirect("/home");
};

export const meta: MetaFunction = () => ({
  title: "Create new tree - Kronikarz",
});

export default function () {
  const transition = useTransition();
  const msg = useActionData();
  return (
    <Form method="post" replace>
      <Stack direction="column" alignItems="flex-start" spacing={4}>
        <Typography variant="h3">Create new tree</Typography>
        {transition.state === "submitting" ? (
          <CircularProgress />
        ) : (
          <>
            {msg && <Alert severity="error">{msg}</Alert>}
            <TextField name="treeName" type="text" id="treeName" label="name" />
          </>
        )}
        <Stack direction="row" spacing={2}>
          <Link to="..">
            <Button
              variant="outlined"
              color="error"
              disabled={transition.state === "submitting"}
            >
              Cancel
            </Button>
          </Link>
          <Button
            variant="contained"
            type="submit"
            disabled={transition.state === "submitting"}
          >
            Create
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}
