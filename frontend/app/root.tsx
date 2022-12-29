import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import CookieConsent from "src/components/CookieConsent";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Kronikarz",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const theme = createTheme({
    palette: {
      primary: {
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
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <meta name="theme-color" content={theme.palette.primary.main} />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <meta
          name="emotion-insertion-point"
          content="emotion-insertion-point"
        />
      </head>
      <body
        style={{
          height: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <CssBaseline />
        <ThemeProvider theme={theme}>
          <Outlet />
          <CookieConsent />
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
