import React, {useMemo, useRef} from "react"
import {animated, config, to, useSpring} from "@react-spring/web"
import {useDisplayEnd, useDisplayStart, useTimePerPixel, useTimeZero} from "../Canvas/store"
import {useGesture} from "@use-gesture/react"
import randomColor from "randomcolor"

export const Event: React.FC = () => {
    let ref = useRef<SVGRectElement>(null)
    let timeZero = useTimeZero()
    let timePerPixel = useTimePerPixel()
    let displayStart = useDisplayStart()
    let displayEnd = useDisplayEnd()
    let x = useMemo(() => Math.random(), [])
    let y = useMemo(() => Math.random(), [])
    let z = useMemo(() => Math.random(), [])
    let color = useMemo(() => randomColor({luminosity: 'light'}), [])

    let [{eventFrom, eventTo}, api] = useSpring(() => ({
        eventFrom: new Date().valueOf() + x * 3600 * 24 * 300 * 1000,
        eventTo: new Date().valueOf() + (2 + 10 * y) * 3600 * 1000 * 24 + x * 3600 * 24 * 300 * 1000
    }))
    useGesture({
        onDrag: ({elapsedTime, delta, down, event}) => {
            event.stopPropagation()
            api.start({
                immediate: down,
                eventFrom: eventFrom.goal + delta[0] * timePerPixel.get(),
                eventTo: eventTo.goal + delta[0] * timePerPixel.get(),
                config: config.stiff
            })
        }
    }, {target: ref, eventOptions: {passive: false}})
    return <animated.g
        display={to([eventFrom, eventTo, displayStart, displayEnd], (from, to, displayStart, displayEnd) => {
            if (to < displayStart || from > displayEnd) {
                return "none"
            }
            return undefined
        })}>
        <animated.rect
            style={{
                touchAction: "none",
                filter: "drop-shadow(0px 0px 1px rgb(0 0 0 / 0.2))",
            }}
            ref={ref}
            rx={2}
            x={to([eventFrom, timeZero, timePerPixel], (from, timeStart, timePerPixel) => {
                return (from - timeStart) / timePerPixel
            })}
            y={120 + Math.round(z * 800 / 30) * 30}
            height={4}
            fill={color}
            width={to([eventFrom, eventTo, timePerPixel], (from, to, timePerPixel) => {
                return Math.max(20, (to - from) / timePerPixel)
            })}
        />
        <animated.foreignObject
            x={to([eventFrom, timeZero, timePerPixel], (from, timeStart, timePerPixel) => {
                return (from - timeStart) / timePerPixel
            })}
            style={{pointerEvents: "none", userSelect: "none"}}
            y={100 + 3 + Math.round(z * 800 / 30) * 30}
            height={20}
            width={to([eventFrom, eventTo, timePerPixel], (from, to, timePerPixel) => {
                return (to - from) / timePerPixel - 10
            })}>
            <div style={{
                height: "100%",
                fontFamily: "Arial",
                paddingLeft: 5,
                paddingRight: 5,
                fontSize: 12,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                lineHeight: "20px"
            }}>
                <span style={{marginRight: 5, fontWeight: 600}}>IT 18.189</span>
                <span style={{fontWeight: 400}}>20 - 22</span>
            </div>
        </animated.foreignObject>
    </animated.g>
}