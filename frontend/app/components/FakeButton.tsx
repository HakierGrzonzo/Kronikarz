import {Tooltip, Button} from "@mui/material"

export default function FakeButton(props: {tooltip: string, text: string}) {
  return (
    <Tooltip title={props.tooltip}>
      <span>
        <Button disabled variant="contained">{props.text}</Button>
      </span>
    </Tooltip>
  )
}
