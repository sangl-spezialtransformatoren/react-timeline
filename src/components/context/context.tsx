import React, {useImperativeHandle, useRef} from "react"
import {CanvasStoreHandle, CanvasStoreProvider} from "../canvas/canvasStore"
import {EventGroupStoreHandle, EventGroupStoreProvider} from "../../hooks/newEventGroup"


export type ReactTimelineHandle = Partial<CanvasStoreHandle> & Partial<EventGroupStoreHandle>

export const TimelineContext = React.forwardRef<ReactTimelineHandle, Record<string, unknown>>(({children}, forwardedRef) => {
    let canvasStoreRef = useRef<CanvasStoreHandle>(null)
    let eventGroupStoreRef = useRef<EventGroupStoreHandle>(null)

    useImperativeHandle(forwardedRef, () => {
        return {
            setTimeStart: canvasStoreRef.current?.setTimeStart,
            setTimePerPixel: canvasStoreRef.current?.setTimePerPixel
        }
    }, [])

    return <CanvasStoreProvider ref={canvasStoreRef}>
        <EventGroupStoreProvider ref={eventGroupStoreRef}>
            {children}
        </EventGroupStoreProvider>
    </CanvasStoreProvider>
})

TimelineContext.displayName = "TimelineContext"