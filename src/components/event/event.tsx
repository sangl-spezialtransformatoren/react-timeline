import React, {useCallback, useMemo, useRef, useState} from 'react'
import {useDrag} from '@use-gesture/react'
import {animated, config, to, useSpring} from '@react-spring/web'
import dayjs from 'dayjs'
import {
    useCanvasStoreApi,
    useRealign,
    useTimePerPixelAnchor,
    useTimePerPixelSpring,
    useTimeStartSpring
} from "../canvas/canvasStore"
import {useEventGroupPosition} from "../../hooks/newEventGroup"
import {round} from "../../functions/round"

let width = 48 * 3600 * 1000
export const Event: React.FC<{groupId: string, eventId: string, label?: string, note?: string}> = React.memo((
    {
        groupId,
        eventId,
        label = "IT 18.189L",
        note = " 3 Stk."
    }) => {
    let timePerPixel = useTimePerPixelAnchor()
    let realign = useRealign()
    let canvasStore = useCanvasStoreApi()

    let [offset, setOffset] = useState(new Date().valueOf())
    let dragStart = useRef(0)
    let bind = useDrag(state => {
        if (state.first) {
            // Realign canvas to prevent scaling problems in safari
            realign()
            dragStart.current = offset
        }
        let timePerPixel = canvasStore.getState().timePerPixel
        state.event.stopPropagation()
        setOffset(dayjs(dragStart.current + state.movement[0] * timePerPixel).startOf('day').valueOf())
    }, [])

    let timeStartSpring = useTimeStartSpring()
    let timePerPixelSpring = useTimePerPixelSpring()


    let [mainLabelWidth, setMainLabelWidth] = useState<number | undefined>(undefined)
    let [mainLabelCharWidths, setMainLabelCharWidths] = useState<number[]>([])
    let [noteWidth, setNoteWidth] = useState<number | undefined>(undefined)

    let mainLabelRef = useCallback((element: SVGTSpanElement) => {
        if (element) {
            setMainLabelWidth(element.getComputedTextLength())
            let charWidths = mainLabelCharWidths
            for (let i = 0; i < element.getNumberOfChars(); i++) {
                charWidths[i] = element.getExtentOfChar(i).width
            }
            if (mainLabelCharWidths !== charWidths) {
                setMainLabelCharWidths(mainLabelCharWidths.slice(0, label?.length || 0))
            }
        }
    }, [label?.length, mainLabelCharWidths])

    let noteRef = useCallback((element: SVGTSpanElement) => {
        if (element) {
            setNoteWidth(element.getComputedTextLength())
        }
    }, [])

    let iMax = useMemo(() => {
        let x = 0
        let res = label?.length
        for (let [i, length] of mainLabelCharWidths.entries()) {
            x += length
            if (x > width / timePerPixel - 30) {
                res = i
                break
            }
        }
        if (res > label?.length - 2) {
            return label.length
        } else if (res > 2) {
            return res
        } else {
            return 0
        }
    }, [label?.length, mainLabelCharWidths, timePerPixel])

    let y = useEventGroupPosition(eventId, groupId, offset, offset + width)
    let {offsetSpring, ySpring} = useSpring({
        offsetSpring: offset,
        ySpring: y * 24 + 70,
        config: config.stiff,
    })
    let transform = to([offsetSpring, ySpring, timePerPixelSpring, timeStartSpring], (offset, y, timePerPixel, timeStart) => `translate(${round((offset - timeStart) / timePerPixel)} ${round(y)})`)
    return <>
        <animated.g className={'drag-target'} {...bind()} style={{transform}}>
            <animated.g transform={transform}>
                <animated.rect
                    x={0}
                    y={0}
                    width={to([timePerPixelSpring], (timePerPixel) => round(width / timePerPixel))}
                    height={24}
                    rx={3}
                    ry={3}
                    style={{
                        fill: "rgba(29,157,70,0.79)",
                        stroke: "rgba(24,117,52,0.79)"
                    }}
                />
            </animated.g>
            <animated.text
                x={to([offsetSpring, timeStartSpring, timePerPixelSpring], (offset, timeStart, timePerPixel) => round((offset - timeStart) / timePerPixel + 8))}
                y={to([ySpring], (y) => round(y + 12))}
                height={24}
                style={{
                    fill: "white",
                    fontFamily: "Roboto",
                    pointerEvents: "none"
                }}>
                <tspan
                    fontWeight={500}
                    fontSize={"0.9em"}
                    dominantBaseline={"middle"}
                    ref={mainLabelRef}>
                    {label?.slice(0, iMax).trim()}{iMax && iMax < label?.length ? "…" : ""}
                </tspan>
                <tspan
                    fontSize={"0.75em"}
                    fontWeight={400}
                    dominantBaseline={"middle"}
                    ref={noteRef}
                    style={{
                        opacity: mainLabelWidth && noteWidth && (mainLabelWidth + noteWidth) < width / timePerPixel - 20 ? 1 : 0,
                        transition: "opacity 0.1s"
                    }}>
                    {note}
                </tspan>
            </animated.text>
        </animated.g>
    </>
})
Event.displayName = "Event"
