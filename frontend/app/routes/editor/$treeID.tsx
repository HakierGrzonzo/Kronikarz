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
import type { LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { useLoaderData, Link, Outlet, useMatches } from "@remix-run/react";
import AppBarRight from "~/components/AppBarRight";
import { createApiClient } from "~/createApiClient";
import { getCookie } from "~/utils/cookieUtils";
import { PlaylistAdd, Reorder } from "@mui/icons-material";
import GetAppIcon from "@mui/icons-material/GetApp";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ExportHandler } from "~/utils/Export";

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
  "Tree View": { icon: PolylineIcon, path: "." },
  "People View": { icon: Diversity3Icon, path: "./people" },
  "Add new Person": { icon: PersonAddAlt1Icon, path: "./addPerson" },
  "My Field Sets": { icon: Reorder, path: "./fieldSets" },
  "Create new Field set": { icon: PlaylistAdd, path: "./addFieldSet" },
};

export default function Editor() {
  let displayExport = false;
  if (typeof window !== "undefined") {
    if (
      window?.location?.pathname?.split("/")[1] === "editor" &&
      window?.location?.pathname?.split("/")[3] === undefined
    ) {
      displayExport = true;
    }
  }

  const exportDataAsImg = () => {
    if (document !== undefined) {
      const canvas = document.getElementsByTagName("canvas")[0];
      const image = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");

      const link = document.createElement("a");
      link.id = "download";
      link.download = "image.png";
      link.href = image;
      link.click();
      document.getElementById("download")?.remove();
    }
  };

  const exportDataAsPDF = () => {
    if (document !== undefined) {
      const canvas = document.getElementsByTagName("canvas")[0];
      // export as pdf
      const pdf = new jsPDF();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297);
      pdf.save("canvas.pdf");
    }
  };

  const exportDataAsHTML = () => {
    if (document !== undefined) {
      const canvas = document.getElementsByTagName("canvas")[0];
      const image = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const htmlPageWithImage = `
      <html>
        <head>
          <title>Image</title>
        </head>
        <body>
          <img src="${image}" />
        </body>
      </html>
      `;
      let blob = new Blob([htmlPageWithImage], { type: "text/html" });
      window.open(URL.createObjectURL(blob));
    }
  };

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
              {displayExport && (
                <Tooltip title="Export as img">
                  <IconButton onClick={exportDataAsImg}>
                    <GetAppIcon />
                  </IconButton>
                </Tooltip>
              )}
              {displayExport && (
                <Tooltip title="Export as pdf">
                  <IconButton onClick={exportDataAsPDF}>
                    <GetAppIcon />
                  </IconButton>
                </Tooltip>
              )}
              {displayExport && (
                <Tooltip title="Export as html">
                  <IconButton onClick={exportDataAsHTML}>
                    <GetAppIcon />
                  </IconButton>
                </Tooltip>
              )}
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
