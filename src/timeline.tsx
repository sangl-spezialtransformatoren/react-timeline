import React, { useEffect, useRef, useState } from 'react'
import { animated, config } from 'react-spring'
import useResizeObserver from 'use-resize-observer'
import './style.css'
import { useGesture } from 'react-use-gesture'
import { DefaultTimelineProps, DefaultTimelineState } from './defaults'
import { TimelineContext, TimelineProps, TimelineState } from './definitions'
import { EventGroup } from './blocks'

export const useTimelineState = (initialState: Partial<TimelineState>) => {
  return useState<TimelineState>({ ...DefaultTimelineState, ...initialState })
}

export const Timeline: React.FC<TimelineProps> = (givenProps) => {
  let props = { ...DefaultTimelineProps, ...givenProps }
  let { children, style, state, setState, initialParameters, onCanvasDrag, onCanvasWheel, onCanvasPinch, onEventDrag, onEventDragStart, onEventDragEnd } = props
  let { internal: { initialized }, data, startDate } = state

  const { ref, width, height } = useResizeObserver<HTMLDivElement>()
  let svgRef = useRef<SVGSVGElement>(null)
  let initialStartDate = initialParameters?.startDate
  let initialEndDate = initialParameters?.endDate

  useEffect(() => {
    console.log('!')
    if ((!initialized) && width && (initialStartDate !== undefined) && (initialEndDate !== undefined)) {
      let timePerPixel = (initialEndDate!.valueOf() - initialStartDate!.valueOf()) / width

      setState({
        ...state,
        startDate: initialStartDate!,
        timePerPixel: timePerPixel,
        internal: {
          ...state.internal,
          initialized: true
        }
      })
    }
  }, [initialStartDate, initialEndDate, initialized, width])

  useEffect(() => {
    setState({ ...state, internal: { ...state.internal, svg: svgRef } })
  }, [svgRef])

  useGesture({
    onDrag: eventState => onCanvasDrag?.({ state, setState, eventState }),
    onWheel: eventState => onCanvasWheel?.({ state, setState, eventState }),
    onPinch: eventState => onCanvasPinch?.({ state, setState, eventState })
  }, { domTarget: svgRef, eventOptions: { passive: false } })

  let context = {
    state,
    setState,
    startDate: startDate,
    endDate: startDate.valueOf() + (width || 0) * state.timePerPixel,
    timePerPixel: state.timePerPixel || 1,
    svgWidth: width || 1,
    springConfig: config.stiff,
    initialized: state.internal.initialized,
    onEventDrag,
    onEventDragStart,
    onEventDragEnd
  }

  return <>
    <TimelineContext.Provider value={context}>
      <div className={'react-timeline'} style={style} ref={ref}>
        <animated.svg
          viewBox={`0 0 ${width} ${height}`}
          className={'react-timeline-svg'}
          ref={svgRef}
        >
          {state.internal.initialized && <>
            {children}
            {data?.events && <EventGroup events={data.events} />}
          </>
          }
        </animated.svg>
      </div>
    </TimelineContext.Provider>
  </>
}