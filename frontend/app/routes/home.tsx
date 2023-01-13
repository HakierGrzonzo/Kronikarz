import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import type { LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";
import type { UserRead } from "~/client";
import AppBarRight from "~/components/AppBarRight";

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
          <AppBarRight userID={user.id} />
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
