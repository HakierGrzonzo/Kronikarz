import { Stack, IconButton, Tooltip, Avatar } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { Link } from "@remix-run/react";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

export default function AppBarRight(props: { userID: string }) {
  const { userID } = props;
  return (
    <Stack direction="row" spacing={2}>
      <Link to="/home">
        <IconButton>
          <HomeIcon />
        </IconButton>
      </Link>
      <Link to="/login">
        <IconButton>
          <MeetingRoomIcon />
        </IconButton>
      </Link>
      <Link to="/user">
        <Tooltip title="User options">
          <Avatar
            alt="user options"
            src={`https://source.boringavatars.com/beam/120/${userID.substring(
              6,
              14
            )}?colors=264653,f4a261,e76f51`}
          />
        </Tooltip>
      </Link>
    </Stack>
  );
}
