import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useMatches } from "@remix-run/react";
import { useState } from "react";
import { createApiClient } from "~/createApiClient";


export const loader: LoaderFunction = async ({ request }) => {
  const cookies = request.headers.get("Cookie")?.split(";");
  if (!cookies) {
    throw redirect("/login");
  }
  const token = cookies?.find((c) => c.trim().startsWith("token="))?.split("=")[1]
  if (!token) {
    throw redirect("/login");
  }
  const api = createApiClient(token);
  const resp = await api.users.usersCurrentUserApiUsersMeGet()
  return json(resp);
};

const routes: { name: string; to: string }[] = [
  { name: "Dashboard", to: "/home" },
  { name: "Logout", to: "/login" },
];

export default function Index() {
  const user = useLoaderData();
  const theme = useTheme();
  const matches = useMatches();
  const matchCandidate = matches
    .filter((m) => routes.map((r) => r.to).includes(m.pathname))
    .at(-1);
  const [menuOpen, setMenuOpen] = useState<boolean>(true);
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
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Kronikarz</Typography>
          </Box>
          <Typography variant="h6">
            {routes.find((r) => matchCandidate?.pathname === r.to)?.name}
          </Typography>
          <Typography>Welcome back {user.email}</Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 64px)",
        }}
      >
        <Box
          sx={{
            width: menuOpen ? "5cm" : "0cm",
            overflow: "visible",
            transition: "all 500ms",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            translate: menuOpen ? "0cm" : "-5cm",
          }}
        >
          <List sx={{ width: "5cm" }} component="nav">
            {routes.map((route) => {
              const isSelected = matchCandidate?.pathname === route.to;
              return (
                <Link
                  to={route.to}
                  key={route.to}
                  style={{
                    color: isSelected
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                    textDecoration: "none",
                  }}
                >
                  <ListItemButton selected={isSelected}>
                    <ListItemText>{route.name}</ListItemText>
                  </ListItemButton>
                </Link>
              );
            })}
          </List>
          <Box sx={{ padding: 1, width: "5cm" }}>
            <img
              src="/logo.png"
              style={{ width: "100%" }}
              alt="Kronikarz logo"
            />
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            height: "calc(100vh - 64px - 16px)",
            margin: 1,
          }}
        >
          <Box sx={{
            overflowY: "auto",
            overflowX: "hidden",
            height: "calc(100vh - 64px - 16px - 1cm)"
          }}>
            <Outlet />
          </Box>
          <Box sx={{ height: '1cm', display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">
              <Link to="/support" style={{ color: theme.palette.grey[600] }}>Support</Link>{" "}
              <a href="https://github.com/HakierGrzonzo/kronikarz" style={{ color: theme.palette.grey[600] }}>Github</a>
            </Typography>
            <Typography variant="caption" color={theme.palette.grey[600]}><strong>NOT FOR COMMERCIAL USE</strong></Typography>
            <Typography variant="caption" color={theme.palette.grey[600]}>Copyright 2022</Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}
