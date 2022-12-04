import {
  Alert,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Box } from "@mui/system";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  try {
    return redirect("/home", {
      headers: {
        "Set-Cookie": `auth=${formData.get("password")}`,
      },
    });
  } catch {
    return json({ msg: "Wrong email or password" });
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
          backgroundImage: "url(https://raw.githubusercontent.com/HakierGrzonzo/Kronikarz/29-ekran-logowania/frontend/public/background.png)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
          backgroundColor: "#e0edf2",
        }}
      >
        <Form method="post">
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
              width: "60vw",
              marginTop: "500px",
              marginLeft: "26px",
            }}
          >
            {actionMsg && <Alert severity="error">{actionMsg.msg}</Alert>}
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
              marginTop: "50px",
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
        </Form>
      </Box>
    </>
  );
}