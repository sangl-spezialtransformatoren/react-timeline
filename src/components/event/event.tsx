import React, {useCallback, useMemo, useRef, useState} from 'react'
import {useCanvasStore, useRealign, useTimePerPixelAnchor, useTimeZero} from '../canvas/canvas'
import {useDrag} from '@use-gesture/react'
import {animated, config, to, useSpring} from '@react-spring/web'
import dayjs from 'dayjs'
import {useEventGroupPosition} from '../../hooks/eventGroup'

let width = 48 * 3600 * 1000
export const Event: React.FC<{groupId: string, eventId: string, label?: string, note?: string}> = (
    {
        groupId,
        eventId,
        label = "IT 18.189L",
        note = " 3 Stk."
    }) => {
    let timeZero = useTimeZero()
    let timePerPixel = useTimePerPixelAnchor()
    let realign = useRealign()


    let [offset, setOffset] = useState(new Date().valueOf())
    let dragStart = useRef(0)
    let bind = useDrag(state => {
        if (state.first) {
            // Realign canvas to prevent scaling problems in safari
            realign()
            dragStart.current = offset
        }
        let timePerPixel = useCanvasStore.getState().timePerPixel
        state.event.stopPropagation()
        setOffset(dayjs(dragStart.current + state.movement[0] * timePerPixel).startOf('day').valueOf())
    }, [])


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

    let y = useEventGroupPosition(groupId, eventId, offset, offset + width)
    let {offsetSpring, ySpring} = useSpring({
        offsetSpring: offset,
        ySpring: y * 24 + 70,
        config: config.stiff,
    })
    let transform = to([offsetSpring, ySpring], (offset, y) => `translate(${(offset - timeZero) / timePerPixel} ${y})`)
    return <>
        <g className={'timely drag-target'} {...bind()}>
            <animated.g transform={transform}>
                <rect
                    x={0}
                    y={0}
                    width={width / timePerPixel}
                    height={24}
                    rx={3}
                    ry={3}
                    style={{
                        fill: "rgba(29,157,70,0.79)",
                        stroke: "rgba(24,117,52,0.79)"
                    }}
                />
                <g className={"timely-dont-scale"} style={{transformOrigin: "left"}}>
                    <text
                        x={8}
                        y={12}
                        width={0.75 * width / timePerPixel}
                        height={24}
                        style={{
                            fill: "white",
                            fontFamily: "Roboto"
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
                    </text>
                </g>
            </animated.g>
        </g>
    </>
}

export const Vacation: React.FC = () => {
    let timeZero = useTimeZero()
    let timePerPixel = useTimePerPixelAnchor()

    let [offset, setOffset] = useState(dayjs().startOf("day").valueOf())
    return <rect
        className={"timely"}
        x={(offset - timeZero) / timePerPixel}
        y={60}
        width={72 * 3600 * 1000 / timePerPixel}
        height={100}
        fill={"rgba(132,210,157,0.79)"}/>
}