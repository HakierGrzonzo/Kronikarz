import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Avatar,
  Stack,
  Tooltip,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import type { LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";
import { UserRead } from "src/client";

export const loader: LoaderFunction = async ({ request }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const user = await api.users.usersCurrentUserApiUsersMeGet();
  return json(user);
};

export default function () {
  const user = useLoaderData() as UserRead;
  return (
    <>
      <AppBar
        sx={{
          position: "static",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignContent: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignContent: "center",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <Typography variant="h6">Kronikarz</Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Link to=".">
              <IconButton>
                <HomeIcon />
              </IconButton>
            </Link>
            <Link to="user">
              <Tooltip title="User options">
                <Avatar
                  alt="user options"
                  src={`https://source.boringavatars.com/beam/120/${user.id}?colors=264653,f4a261,e76f51`}
                />
              </Tooltip>
            </Link>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 64px)",
          padding: 1,
        }}
      >
        <Outlet />
      </Box>
    </>
  );
}
