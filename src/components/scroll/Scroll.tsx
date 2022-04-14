import {animated, to} from "@react-spring/web"
import React, {useCallback, useEffect, useMemo} from "react"
import {useCanvasStore, useScrollOffsetSpring} from "../canvas/canvasStore"

let idCounter = 0
export const Scroll: React.FC = ({children}) => {
    let setContentHeight = useCanvasStore(state => state.setScrollContainerHeight)
    let unregister = useCanvasStore(state => state.unregisterScrollContainer)

    let id = useMemo(() => {
        let id = idCounter.toString()
        idCounter += 1
        return id
    }, [])

    useEffect(() => {
        return () => unregister(id)
    }, [id, unregister])

    let ref = useCallback((element: SVGGElement) => {
        let observer = new ResizeObserver((e) => {
            setContentHeight(id, e[0].contentRect.height)
        })
        observer.observe(element)
    }, [id, setContentHeight])


    let scrollOffsetSpring = useScrollOffsetSpring()
    let transform = to([scrollOffsetSpring], (scrollOffset) => `translate(0, ${-scrollOffset}px)`)

    return <g ref={ref}>
        <animated.g style={{transform}}>
            <line x1={0} y1={0} x2={0} y2={0} stroke={"none"} fill={"none"}/>
            {children}
        </animated.g>
    </g>
}