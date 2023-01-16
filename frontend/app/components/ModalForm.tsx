import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useFetcher } from "@remix-run/react";
import { TextField } from "@mui/material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function ModalForm({
  treeID,
  current,
  open,
  handleClose,
}: {
  treeID: string;
  current: any;
  open: boolean;
  handleClose: () => void;
}) {
  const fetcher = useFetcher();
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const label = e.target.label.value;
    const startDate = e.target["start-date"].value;
    const endDate = e.target["end-date"].value;
    const color = e.target.color.value;
    fetcher.submit(
      {
        treeID,
        from: current.from,
        to: current.to,
        label,
        startDate,
        endDate,
        color,
        type: "addEdge",
      },
      { method: "post", replace: true }
    );
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add relation
        </Typography>
        <form onSubmit={handleSubmit}>
          <Typography sx={{ mt: 2 }}>Start date:</Typography>
          <TextField key="start-date" type="date" name="start-date" />
          <Typography sx={{ mt: 2 }}>End date:</Typography>
          <TextField key="end-date" type="date" name="end-date" />
          <Typography sx={{ mt: 2 }}>Choose color:</Typography>
          <input type="color" id="color" name="color" />
          <Typography sx={{ mt: 2 }}>Label:</Typography>
          <input type="text" name="label" placeholder="Label" />
          <br />
          <button type="submit">Save</button>
          <button onClick={handleClose}>Cancel</button>
        </form>
      </Box>
    </Modal>
  );
}
