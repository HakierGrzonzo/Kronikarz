import {
  Alert,
  Button,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { createApiClient } from "~/createApiClient";

export const action: ActionFunction = async ({ request }) => {
  const api = createApiClient();
  const formData = await request.formData();
  try {
    await api.auth.registerRegisterApiAuthRegisterPost({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
    return redirect("/login", {
      headers: {
        "Set-Cookie": `isFirstTime=${true}`,
      },
    });
  } catch {
    return json({
      msg: "Wrong/empty email or password. Or this user already exist",
    });
  }
};

export const meta: MetaFunction = () => {
  return { title: "Hello to Kronikarz" };
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
          Please Register:
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
