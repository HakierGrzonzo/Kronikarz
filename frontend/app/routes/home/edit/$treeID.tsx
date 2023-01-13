import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";
import type {
  LoaderFunction,
  ActionFunction,
  MetaFunction,
} from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useFetcher,
  useActionData,
  useNavigate,
} from "@remix-run/react";
import type { Tree } from "~/client";
import type { AlertProps } from "@mui/material";
import {
  Typography,
  Stack,
  Divider,
  TextField,
  Button,
  Modal,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useState } from "react";

export const loader: LoaderFunction = async ({ request, params }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const { treeID } = params;
  if (treeID === undefined) {
    throw Error("No treeID!");
  }
  const api = createApiClient(token);
  const tree = await api.trees.getDetailedTreeApiTreesTreeIdGet(treeID);
  return json(tree);
};

export const meta: MetaFunction = ({ data }) => ({
  title: `Edit - ${data.name} - Kronikarz`,
});

export const action: ActionFunction = async ({ request, params }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const { treeID } = params;
  if (treeID === undefined) {
    throw Error("No treeID!");
  }
  const api = createApiClient(token);
  const form = await request.formData();
  const type = (form.get("type") || "rename") as "rename" | "delete";
  if (type === "rename") {
    const newName = form.get("newName");
    if (!newName) {
      return json({
        severity: "error",
        children: "It is impossible to assign an empty name to a tree!",
      });
    }
    await api.trees.renameTreeApiTreesTreeIdRenamePost(
      treeID,
      newName as string
    );
    return json({
      severity: "success",
      children: "Successfully changed the name!",
      showGoBackButton: true,
    });
  } else if (type === "delete") {
    await api.trees.deleteTreeApiTreesTreeIdDeletePost(treeID);
    return redirect("/home");
  }
};

export default function () {
  const tree = useLoaderData() as Tree;
  const fetcher = useFetcher();
  const actionAlert = useActionData() as
    | null
    | (Partial<AlertProps> & { showGoBackButton?: boolean });
  const [deletePopup, setDeletePopup] = useState<boolean>(false);
  const navigator = useNavigate();
  return (
    <Stack spacing={2}>
      {actionAlert && (
        <Alert
          action={
            actionAlert.showGoBackButton && (
              <Button color="inherit" onClick={() => navigator("..")}>
                Go back to tree view
              </Button>
            )
          }
          {...actionAlert}
        />
      )}
      <Typography variant="h3">
        Edit tree <em>{tree.name}</em>
      </Typography>
      <Divider />
      <Form replace method="post">
        <Stack alignItems="flex-start" spacing={2}>
          <Typography variant="h6">Change tree name:</Typography>
          <TextField
            name="newName"
            type="text"
            defaultValue={tree.name}
            label="New name"
          />
          <Button type="submit" variant="contained">
            Change Name
          </Button>
        </Stack>
      </Form>
      <Divider />
      <Stack alignItems="flex-start" spacing={2}>
        <Typography variant="h6">Dangerous Zone</Typography>
        <Button
          color="error"
          variant="contained"
          onClick={() => setDeletePopup(true)}
        >
          Delete Tree
        </Button>
        <Modal open={deletePopup}>
          <Alert
            variant="filled"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              padding: 1,
            }}
            severity="error"
          >
            <AlertTitle>Warning!</AlertTitle>
            You are trying to delete a tree with all the associated files! You
            will not be able to undo this action!
            <Stack direction="row" spacing={1} sx={{ marginTop: 2 }}>
              <Button color="inherit" onClick={() => setDeletePopup(false)}>
                Cancel
              </Button>
              <Button
                color="inherit"
                onClick={() =>
                  fetcher.submit({ type: "delete" }, { method: "post" })
                }
              >
                Delete
              </Button>
            </Stack>
          </Alert>
        </Modal>
      </Stack>
    </Stack>
  );
}
