import React, { StatelessComponent } from "react"
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button
} from "@material-ui/core"
import { Menu as MenuIcon, KeyboardTab } from "@material-ui/icons"
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab"
import Track from "common/track/Track"

import Icon from "components/outputs/Icon"

import QuantizeSelector from "components/QuantizeSelector/QuantizeSelector"

import { PianoRollMouseMode } from "stores/PianoRollStore"
import { makeStyles } from "@material-ui/styles"
import InstrumentBrowser from "../InstrumentBrowser/InstrumentBrowser"
import { VolumeSlider } from "./VolumeSlider"
import { PanSlider } from "./PanSlider"

const useStyles = makeStyles(theme => ({
  title: {
    marginRight: "1rem"
  },
  toggleButtonGroup: {
    backgroundColor: "transparent",
    marginRight: "1rem"
  },
  toggleButton: {
    height: "2rem",
    color: "inherit",
    ["&.Mui-selected"]: {
      color: "rgba(255, 255, 255, 0.5)"
    }
  }
}))

export interface PianoRollToolbarProps {
  track: Track
  autoScroll: boolean
  onClickAutoScroll: () => void
  mouseMode: PianoRollMouseMode
  onClickPencil: () => void
  onClickSelection: () => void
  quantize: number
  onSelectQuantize: (e: { denominator: number }) => void
  onChangeVolume: (value: number) => void
  onChangePan: (value: number) => void
  onClickInstrument: () => void
  onClickNavBack: () => void
}

export const PianoRollToolbar: StatelessComponent<PianoRollToolbarProps> = ({
  track,
  onChangeVolume,
  onChangePan,
  onClickInstrument,
  onClickNavBack,
  autoScroll,
  onClickAutoScroll,
  mouseMode,
  onClickPencil,
  onClickSelection,
  quantize,
  onSelectQuantize
}) => {
  const classes = useStyles({})
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton onClick={onClickNavBack} color="inherit">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          {track.displayName}
        </Typography>
        <Button onClick={onClickInstrument} color="inherit">
          <Icon>piano</Icon>
          {track.instrumentName}
        </Button>
        <InstrumentBrowser />

        <VolumeSlider
          onChange={(_, value) => onChangeVolume(value as number)}
          value={track.volume}
        />
        <PanSlider
          value={track.pan}
          onChange={(_, value) => onChangePan(value as number)}
        />
        <ToggleButtonGroup
          value={mouseMode}
          className={classes.toggleButtonGroup}
        >
          <ToggleButton
            color="inherit"
            onClick={onClickPencil}
            value="pencil"
            className={classes.toggleButton}
          >
            <Icon>pencil</Icon>
          </ToggleButton>
          <ToggleButton
            color="inherit"
            onClick={onClickSelection}
            value="selection"
            className={classes.toggleButton}
          >
            <Icon>select</Icon>
          </ToggleButton>
        </ToggleButtonGroup>

        <QuantizeSelector
          value={quantize}
          onSelect={value => onSelectQuantize({ denominator: value })}
        />

        <ToggleButton
          color="inherit"
          onClick={onClickAutoScroll}
          selected={autoScroll}
          className={classes.toggleButton}
        >
          <KeyboardTab />
        </ToggleButton>
      </Toolbar>
    </AppBar>
  )
}
