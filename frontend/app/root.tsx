import { Alert, AlertTitle, Box, createTheme, CssBaseline, ThemeProvider, Typography } from "@mui/material";
import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Kronikarz tool for chronology tree",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const theme = createTheme({
    palette: {
      primary: {
        // main: "#65B2A3",
        main: "#A08D8D",
      },
      secondary: {
        main: "#888798",
      },
      background: {
        default: "#E0EEED",
      },
    },
  });

  return (
    <html lang="en" >
      <head>
        <Meta />
        <Links />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </head>
      <body>
        <CssBaseline />
        <ThemeProvider theme={theme}>
          <Outlet />
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html >
  );
}

export function CatchBoundary() {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      justifyContent: 'center'
    }}>
      <Alert severity="error" sx={{ width: "15cm" }}>
        <AlertTitle>You don't have permission to access this page!</AlertTitle>
        <Typography variant="body1">
          You don't have permissions to access this page, please contact your
          supervisor if those permissions are necessary for your work.
        </Typography>
      </Alert>
    </Box>
  )
}
