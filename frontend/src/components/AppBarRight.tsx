import { Stack, IconButton, Tooltip, Avatar } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { Link } from "@remix-run/react";

export default function AppBarRight(props: { userID: string }) {
  const { userID } = props;
  return (
    <Stack direction="row" spacing={2}>
      <Link to="/home">
        <IconButton>
          <HomeIcon />
        </IconButton>
      </Link>
      <Link to="/user">
        <Tooltip title="User options">
          <Avatar
            alt="user options"
            src={`https://source.boringavatars.com/beam/120/${userID}?colors=264653,f4a261,e76f51`}
          />
        </Tooltip>
      </Link>
    </Stack>
  );
}
