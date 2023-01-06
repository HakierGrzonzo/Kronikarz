import {
  Alert,
  Button,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { createApiClient } from "~/createApiClient";
import { cookieMaker, deleteCookie, makeCookie } from "~/utils/cookieUtils";

export const action: ActionFunction = async ({ request }) => {
  const api = createApiClient();
  const formData = await request.formData();
  try {
    const resp = await api.auth.authJwtLoginApiAuthJwtLoginPost({
      username: formData.get("email") as string,
      password: formData.get("password") as string,
    });
    const headers = cookieMaker([
      makeCookie("token", resp.access_token),
      deleteCookie("isFirstTime"),
    ]);
    return redirect("/home", {
      headers,
    });
  } catch {
    return json({ msg: "Wrong email or password" });
  }
};

export default function Login() {
  const transition = useTransition();
  const actionMsg = useActionData();
  return (
    <Box
      sx={{
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <img
        src="/logo.png"
        alt="Kronikarz logo"
        style={{ maxHeight: "80vh", width: "auto" }}
      />
      <Form
        method="post"
        replace
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "-3cm",
        }}
      >
        <Typography variant="h2" sx={{ textAlign: "center" }}>
          Please Login:
        </Typography>
        <Box
          sx={{
            display: "grid",
            padding: 1,
            gap: 6,
            gridTemplateColumns: "1fr 1fr",
            maxWidth: "18cm",
            justifyContent: "space-around",
          }}
        >
          {transition.state !== "submitting" ? (
            <>
              <TextField name="email" type="email" id="email" label="email" />
              <TextField
                name="password"
                type="password"
                id="password"
                label="password"
              />
            </>
          ) : (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "4cm",
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Box>
        <Button
          variant="contained"
          type="submit"
          disabled={transition.state === "submitting"}
        >
          Submit
        </Button>
        {actionMsg && <Alert severity="error">{actionMsg.msg}</Alert>}
      </Form>
    </Box>
  );
}
