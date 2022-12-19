import {
  Modal,
  Typography,
  Card,
  Divider,
  CardActions,
  CardContent,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [cookieConsent, setCookieConsent] = useState<boolean>(false);
  useEffect(() => {
    const rawCookieConsent = localStorage.getItem("cookieConsent");
    if (rawCookieConsent) {
      // If there is a value, then we must have set it to true
      setCookieConsent(true);
    }
  }, [setCookieConsent]);

  const cookieAccept = () => {
    localStorage.setItem("cookieConsent", "yes");
    setCookieConsent(true);
  };

  return (
    <Modal open={!cookieConsent}>
      <Card
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: 1,
        }}
      >
        <CardContent>
          <Typography variant="h1">Cookies</Typography>
          <Divider />
          <Typography variant="body1">We use cookies</Typography>
        </CardContent>
        <CardActions>
          <Button onClick={cookieAccept}>Accept</Button>
        </CardActions>
      </Card>
    </Modal>
  );
}
