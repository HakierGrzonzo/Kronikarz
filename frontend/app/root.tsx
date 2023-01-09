import { useTheme } from "@mui/material";
import { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useContext } from "react";
import CookieConsent from "~/components/CookieConsent";
import StylesContext from "./styles/StylesContext";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Kronikarz",
  viewport: "width=device-width,initial-scale=1",
});

function Document(props: {
  title?: string;
  children?: JSX.Element | JSX.Element[];
}) {
  const styleData = useContext(StylesContext);
  const theme = useTheme();

  return (
    <html lang="en">
      <head>
        {props.title && <title>{props.title}</title>}
        <Meta />
        <Links />
        <meta name="theme-color" content={theme.palette.primary.main} />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        {styleData?.map(({ key, ids, css }) => (
          <style
            key={key}
            data-emotion={`${key} ${ids.join(" ")}`}
            dangerouslySetInnerHTML={{ __html: css }}
          />
        ))}
      </head>
      <body
        style={{
          height: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {props.children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
      <CookieConsent />
    </Document>
  );
}
