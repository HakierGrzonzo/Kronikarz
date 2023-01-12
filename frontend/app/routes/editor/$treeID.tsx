import {
  AppBar,
  Toolbar,
  Stack,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PolylineIcon from "@mui/icons-material/Polyline";
import { LoaderFunction, redirect, json } from "@remix-run/node";
import { useLoaderData, Link, Outlet, useMatches } from "@remix-run/react";
import AppBarRight from "~/components/AppBarRight";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";
import { PlaylistAdd, Reorder } from "@mui/icons-material";

export const loader: LoaderFunction = async ({ request, params }) => {
  const token = getCookie(request, "token");
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const { treeID } = params;
  if (treeID === undefined) throw Error("treeID not given");
  const user = await api.users.usersCurrentUserApiUsersMeGet();
  return json(user);
};

const pages = {
  ["Tree View"]: { icon: PolylineIcon, path: "." },
  ["People View"]: { icon: Diversity3Icon, path: "./people" },
  ["Add new Person"]: { icon: PersonAddAlt1Icon, path: "./addPerson" },
  ["My Field Sets"]: { icon: Reorder, path: "./fieldSets" },
  ["Create new Field set"]: { icon: PlaylistAdd, path: "./addFieldSet" },
};

export default function Editor() {
  const user = useLoaderData();
  const matches = useMatches();
  const currentPageID =
    matches.find((match) => !!pages[match.handle as unknown as string])
      ?.handle || "";
  return (
    <>
      <AppBar sx={{ position: "static" }}>
        <Toolbar>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ width: "100%" }}
          >
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              {Object.entries(pages).map(([pageID, page]) => (
                <Link to={page.path} key={pageID}>
                  <Tooltip title={pageID}>
                    <IconButton
                      color={currentPageID === pageID ? "info" : "default"}
                    >
                      <page.icon />
                    </IconButton>
                  </Tooltip>
                </Link>
              ))}
            </Stack>
            <AppBarRight userID={user.id} />
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 64px)",
        }}
      >
        <Outlet />
      </Box>
    </>
  );
}
