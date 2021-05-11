import { ControllerEvent } from "midifile-ts"
import React, { FC } from "react"
import { TrackEvent } from "../../../../common/track"
import LineGraphControl, {
  LineGraphControlEvent,
  LineGraphControlProps,
} from "./LineGraphControl"

export type PanGraphProps = Omit<
  LineGraphControlProps,
  "createEvent" | "onClickAxis" | "maxValue" | "className" | "axis" | "events"
> & {
  events: TrackEvent[]
  createEvent: (value: number, tick?: number) => void
}

const PanGraph: FC<PanGraphProps> = ({
  width,
  height,
  events,
  createEvent,
}) => {
  const filteredEvents = events.filter(
    (e) => (e as any).controllerType === 0x0a
  ) as (LineGraphControlEvent & ControllerEvent)[]

  return (
    <LineGraphControl
      className="PanGraph"
      width={width}
      height={height}
      maxValue={127}
      events={filteredEvents}
      axis={[-0x40, -0x20, 0, 0x20, 0x40 - 1]}
      createEvent={(obj) => createEvent(obj.value, obj.tick)}
      onClickAxis={(value) => createEvent(value + 0x40)}
    />
  )
}

export default React.memo(PanGraph)
