import { AppBar, Box, Card, Typography, Button, Divider } from "@mui/material";
import { Link } from "@remix-run/react";
import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => ({
  title: "Kronikarz: free tool for family trees",
});

export default function () {
  return (
    <Box
      sx={{
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img
        src="/logo.png"
        alt="Kronikarz logo"
        style={{ maxHeight: "80vh", width: "auto" }}
      />
      <Box
        sx={{
          display: "grid",
          padding: 1,
          gap: 4,
          gridTemplateColumns: "1fr 1fr",
          maxWidth: "10cm",
          justifyContent: "space-around",
        }}
      >
        <Button sx={{ fontSize: "150%" }} variant="contained" href="/login">
          Login
        </Button>
        <Button sx={{ fontSize: "150%" }} variant="contained" href="/register">
          Register
        </Button>
      </Box>
    </Box>
  );
}
