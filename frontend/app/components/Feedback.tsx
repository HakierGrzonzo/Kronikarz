import { Alert, AlertColor, Snackbar } from "@mui/material";
import { useState } from "react";

export default function Feedback(props: { severity: AlertColor; msg: string }) {
  const [open, setOpen] = useState<boolean>(true);
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={() => setOpen(false)}
    >
      <Alert severity={props.severity}>{props.msg}</Alert>
    </Snackbar>
  );
}
