import React, { SVGProps, useContext, useEffect, useRef, useState } from 'react'
import { TimelineContext, TimelineData } from './definitions'
import { Interval } from 'date-fns'
import { animated, AnimatedProps, useSpring } from 'react-spring'
import { useGesture } from 'react-use-gesture'

export type EventGroupProps = {
  events: TimelineData['events']
}


export const EventGroup: React.FC<EventGroupProps> = ({ events }) => {
  let [positions, setPositions] = useState<{ [id: string]: number }>({})
  let {springConfig} = useContext(TimelineContext)

  let [{ height }] = useSpring({
    height: (Math.max(...Object.values(positions)) + 1) * 20,
    config: springConfig
  }, [positions])

  useEffect(() => {
    let eventOrder = Object.entries(events).reduce<[Date | number, string][]>((list, [id, event]) => {
      return [...list, [event.interval.start, id], [event.interval.end, id]]
    }, []).sort((a, b) => a[0].valueOf() - b[0].valueOf())

    let positions = eventOrder.reduce<[{ [id: string]: number }, number[]]>(([positions, freePositions], [_, id]) => {
      let position: number
      let returnValue: [{ [id: string]: number }, number[]]
      if (Object.keys(positions).includes(id)) {
        returnValue = [{ ...positions }, [...freePositions, positions[id]]]
      } else {
        if (freePositions.length > 0) {
          position = Math.min(...freePositions)
        } else {
          position = Math.max(...Object.entries(positions).map(([_, position]) => position)) + 1
        }
        returnValue = [{ ...positions, [id]: position }, freePositions.filter(p => p !== position)]
      }
      return returnValue
    }, [{}, [0]])[0]
    setPositions(positions)
  }, [events])

  return <g>
    {Object.entries(events).map(([id, event]) => {
      return <TimeRect id={id} interval={event.interval} y={positions[id] || 0} label={event.label} />
    })}
    <animated.rect x={0} y={0} height={height} width={100} fill={'yellow'} />
  </g>
}

export type TimeRectProps = {
  id: any,
  interval: Interval,
  label?: string,
  y: number
} & Omit<AnimatedProps<SVGProps<SVGRectElement>>, 'ref' | 'y'>


export const TimeRect: React.FC<TimeRectProps> = ({ interval, ...props }) => {
  let ref = useRef<SVGRectElement>(null)
  let startRef = useRef<SVGRectElement>(null)
  let endRef = useRef<SVGRectElement>(null)

  let { startDate, timePerPixel, springConfig, onEventDrag, onEventDragStart, onEventDragEnd, state, setState } = useContext(TimelineContext)

  let [{ x, width, x1, y }] = useSpring({
    x: (interval.start.valueOf() - startDate.valueOf()) / timePerPixel,
    x1: (interval.end.valueOf() - startDate.valueOf()) / timePerPixel,
    width: (interval.end.valueOf() - interval.start.valueOf()) / timePerPixel,
    y: props.y,
    config: springConfig
  }, [interval, springConfig, props.y, startDate])

  let transform = y.to(y => `translate(0, ${y * 20})`)

  useGesture({
    onDrag: eventState => onEventDrag?.({ state, setState, eventState, id: props.id })
  }, { domTarget: ref, eventOptions: { passive: false } })

  useGesture({
    onDrag: eventState => onEventDragStart?.({ state, setState, eventState, id: props.id })
  }, { domTarget: startRef, eventOptions: { passive: false } })

  useGesture({
    onDrag: eventState => onEventDragEnd?.({ state, setState, eventState, id: props.id })
  }, { domTarget: endRef, eventOptions: { passive: false } })

  return <animated.g transform={transform}>
    <animated.rect ref={ref} fill={'gray'} height={20} style={{paintOrder: "stroke"}}{...props} y={0} x={x} width={width}  />
    <animated.rect ref={startRef} fill={'transparent'} y={0} height={20} x={x} width={10}
                   style={{ cursor: 'ew-resize' }} />
    <animated.rect ref={endRef} fill={'transparent'} y={0} height={20} x={x1} width={10} style={{ cursor: 'ew-resize' }}
                   transform={'translate(-10, 0)'} />
    <animated.foreignObject y={0} height={20} x={x} width={width} style={{ pointerEvents: 'none' }}>
      <div className={'react-timeline-event'}>
        {props.label}
      </div>
    </animated.foreignObject>
  </animated.g>
}