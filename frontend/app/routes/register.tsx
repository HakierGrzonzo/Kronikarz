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
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundImage: "url(/background.png)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
          backgroundColor: "#e0edf2",
        }}
      >
        <Form method="post">
          <Typography
            variant="h2"
            sx={{ margin: "515px 0 25px 26px", textAlign: "center" }}
          >
            Please Register:
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
              width: "60vw",
              marginLeft: "26px",
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "60vw",
              marginTop: "30px",
              marginBottom: "20px",
              marginLeft: "26px",
            }}
          >
            <Button
              variant="contained"
              type="submit"
              disabled={transition.state === "submitting"}
            >
              Submit
            </Button>
          </Box>
          {actionMsg && <Alert severity="error">{actionMsg.msg}</Alert>}
        </Form>
      </Box>
    </>
  );
}
