import {
  Button,
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";
import { Tree } from "src/client";
import { redirect, json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Add, Edit } from "@mui/icons-material";

export const loader: LoaderFunction = async ({ request }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const trees = await api.trees.listMyTreesApiTreesMyGet();
  return json(trees);
};

export default function () {
  const trees = useLoaderData() as Tree[];
  return (
    <Stack direction="column" spacing={2} sx={{ maxWidth: "100%" }}>
      <Typography variant="h3">Your family trees:</Typography>
      <Stack
        direction="row"
        sx={{ flexWrap: "wrap", maxWidth: "100%", gap: 2 }}
        alignItems="stretch"
      >
        {trees.map((tree) => (
          <Card sx={{ minWidth: 400 }} key={tree.id}>
            {/* TODO: Photo of a random person from the tree? */}
            <CardMedia sx={{ height: 200 }} image="/tree.jpg" />
            <CardHeader
              title={tree.name}
              action={
                <Link to={`./edit/${tree.id}`}>
                  <IconButton>
                    <Edit />
                  </IconButton>
                </Link>
              }
            />
            <CardActions>
              <Link to={`/editor/${tree.id}`}>
                <Button variant="contained">Open</Button>
              </Link>
            </CardActions>
          </Card>
        ))}
        <Card>
          <Stack
            sx={{ width: 200, height: "100%" }}
            alignItems="center"
            justifyContent="center"
          >
            <Link to="./addTree">
              <IconButton size="large">
                <Add fontSize="inherit" />
              </IconButton>
            </Link>
            <Typography variant="body1" sx={{ textDecoration: "none" }}>
              Create new tree
            </Typography>
          </Stack>
        </Card>
      </Stack>
    </Stack>
  );
}
