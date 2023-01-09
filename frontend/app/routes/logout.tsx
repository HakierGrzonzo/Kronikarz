import { Alert, AlertTitle, Button, Stack } from "@mui/material";
import { Link } from "@remix-run/react";

export default function LogoutPage() {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ width: "100vw", height: "100vh" }}
    >
      <Alert severity="info" variant="outlined">
        <AlertTitle>You have been logged out!</AlertTitle>
        <Link to="/login">
          <Button color="info" variant="outlined">
            Go to login
          </Button>
        </Link>
      </Alert>
    </Stack>
  );
}
