import { TimelineContextShape, TimelineProps, TimelineState } from './definitions'
import { config } from 'react-spring'


export const DefaultTimelineState: TimelineState = {
  startDate: new Date().valueOf(),
  timePerPixel: 1,
  internal: {
    svg: undefined,
    initialized: false,
    wheelingCenter: undefined
  }
}

export const DefaultTimelineContext: TimelineContextShape = {
  state: DefaultTimelineState,
  startDate: 0,
  endDate: 0,
  timePerPixel: 0,
  svgWidth: 1,
  springConfig: config.stiff,
  initialized: false,
  setState: () => null,
  onEventDrag: () => null,
  onEventDragEnd: () => null,
  onEventDragStart: () => null
}

export const defaultOnCanvasDrag: TimelineProps['onCanvasDrag'] = ({ state, setState, eventState }) => {
  let { pinching } = eventState
  if (!pinching) {
    setState({
      ...state,
      startDate: state.startDate.valueOf() - eventState.delta[0] * state.timePerPixel
    })
  }
}

export const defaultOnCanvasWheel: TimelineProps['onCanvasWheel'] = ({ state, eventState, setState }) => {
  let svg = state.internal.svg?.current
  if (svg !== undefined && svg !== null) {
    let { timePerPixel, startDate, internal: { wheelingCenter } } = state
    let dateOfMouse
    if (wheelingCenter) {
      dateOfMouse = wheelingCenter
    } else {
      let point = svg.createSVGPoint()
      point.x = eventState.event.clientX
      point.y = eventState.event.clientY
      let pos = point.matrixTransform(svg.getScreenCTM()?.inverse())
      dateOfMouse = startDate.valueOf() + timePerPixel * pos.x
    }
    let factor = 0.002
    let { delta } = eventState
    let newTimePerPixel = timePerPixel * (1 + factor * delta[1])
    let newStartDate = (timePerPixel - newTimePerPixel) * dateOfMouse!.valueOf() / timePerPixel + startDate.valueOf() * newTimePerPixel / timePerPixel
    setState({
      ...state,
      timePerPixel: newTimePerPixel,
      startDate: newStartDate,
      internal: {
        ...state.internal,
        wheelingCenter: eventState.last ? undefined : dateOfMouse
      }
    })
  }
}

export const defaultOnCanvasPinch: TimelineProps['onCanvasPinch'] = ({ state, setState, eventState }) => {
  let svg = state.internal.svg?.current
  if (svg) {
    let { timePerPixel, startDate, internal: { wheelingCenter } } = state

    let dateOfMouse
    if (wheelingCenter) {
      dateOfMouse = wheelingCenter
    } else {
      let point = svg.createSVGPoint()
      point.x = eventState.origin[0]
      point.y = eventState.origin[1]
      let pos = point.matrixTransform(svg.getScreenCTM()?.inverse())
      dateOfMouse = startDate.valueOf() + timePerPixel * pos.x
    }

    let { previous, da, first } = eventState
    let scale: number
    if (!first) {
      scale = da[0] / previous[0]
    } else {
      scale = 1
    }
    let newTimePerPixel = timePerPixel / scale
    let newStartDate = (timePerPixel - newTimePerPixel) * dateOfMouse!.valueOf() / timePerPixel + startDate.valueOf() * newTimePerPixel / timePerPixel
    setState({
      ...state,
      timePerPixel: newTimePerPixel,
      startDate: newStartDate,
      internal: {
        ...state.internal,
        wheelingCenter: eventState.last ? undefined : dateOfMouse
      }
    })
  }
}

export const defaultOnEventDrag: TimelineProps['onEventDrag'] = ({ eventState, state, setState, id }) => {
  eventState.event.stopPropagation()

  let { delta: [dx] } = eventState
  let { timePerPixel } = state
  setState({
    ...state,
    data: {
      ...state.data,
      events: {
        ...state.data?.events,
        [id]: {
          ...state.data?.events[id],
          interval: {
            start: ((state.data?.events[id].interval.start.valueOf() || 0) + dx * timePerPixel) /10,
            end: (state.data?.events[id].interval.end.valueOf() || 0) + dx * timePerPixel
          }

        }
      }
    }
  })
}

export const defaultOnEventDragStart: TimelineProps['onEventDragStart'] = ({ eventState, state, setState, id }) => {
  eventState.event.stopPropagation()
  let { delta: [dx] } = eventState
  let { timePerPixel } = state
  setState({
    ...state,
    data: {
      ...state.data,
      events: {
        ...state.data?.events,
        [id]: {
          ...state.data?.events[id],
          interval: {
            ...state.data?.events[id].interval,
            start: (state.data?.events[id].interval.start.valueOf() || 0) + dx * timePerPixel
          }

        }
      }
    }
  })
}

export const defaultOnEventDragEnd: TimelineProps['onEventDragEnd'] = ({ eventState, state, setState, id }) => {
  eventState.event.stopPropagation()
  let { delta: [dx] } = eventState
  let { timePerPixel } = state
  setState({
    ...state,
    data: {
      ...state.data,
      events: {
        ...state.data?.events,
        [id]: {
          ...state.data?.events[id],
          interval: {
            ...state.data?.events[id].interval,
            end: (state.data?.events[id].interval.end.valueOf() || 0) + dx * timePerPixel
          }

        }
      }
    }
  })
}


export const DefaultTimelineProps: Partial<TimelineProps> = {
  onCanvasDrag: defaultOnCanvasDrag,
  onCanvasWheel: defaultOnCanvasWheel,
  onCanvasPinch: defaultOnCanvasPinch,
  onEventDrag: defaultOnEventDrag,
  onEventDragEnd: defaultOnEventDragEnd,
  onEventDragStart: defaultOnEventDragStart,
  sprintConfig: config.stiff
}