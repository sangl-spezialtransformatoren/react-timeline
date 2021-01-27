import React, {RefObject, useContext, useEffect, useRef} from "react"
import {useSetHeaderHeight} from "./store/actions"
import {useResizeObserver} from "./hooks"
import {useSize} from "./store/hooks"
import {createPortal} from "react-dom"
import {useDrag} from "react-use-gesture"

export const LayerContext = React.createContext<{
    grid: RefObject<SVGGElement>,
    header: RefObject<SVGGElement>,
    groupBackgrounds: RefObject<SVGGElement>
    groupLabels: RefObject<SVGGElement>
    events: RefObject<SVGGElement>
}>(undefined!)

export const TimelineLayers: React.FC = ({children}) => {
    let gridRef = useRef<SVGGElement>(null)
    let groupBackgroundsRef = useRef<SVGGElement>(null)
    let groupLabelsRef = useRef<SVGGElement>(null)
    let eventsRef = useRef<SVGGElement>(null)

    let setHeaderHeight = useSetHeaderHeight()
    let [headerRef, {height: headerHeight}] = useResizeObserver<SVGGElement>()
    let {width, height} = useSize()

    useEffect(() => {
        setHeaderHeight(headerHeight)
    }, [headerHeight])

    let scrollRef = useRef<SVGRectElement>(null)

    useDrag((eventState) => {
        let y = eventState.movement[1]
        window.scrollBy({top: -y, behavior: "smooth"})
    }, {domTarget: scrollRef})

    return <LayerContext.Provider value={{
        grid: gridRef,
        header: headerRef,
        groupBackgrounds: groupBackgroundsRef,
        groupLabels: groupLabelsRef,
        events: eventsRef
    }}>
        <g id={"grid"} ref={gridRef}/>
        <g id={"group-backgrounds"} transform={`translate(0 ${headerHeight})`} ref={groupBackgroundsRef}/>
        {
            //Mask background so that the pinch event is handled correctly
        }
        <rect x={0} y={0} width={width} height={height} fill={'transparent'} ref={scrollRef}/>
        <g id={"events"} transform={`translate(0 ${headerHeight})`} ref={eventsRef}/>
        <g id={"group-labels"} transform={`translate(0 ${headerHeight})`} ref={groupLabelsRef}/>
        <g id={"header"} ref={headerRef}/>
        {children}
    </LayerContext.Provider>
}

export const AsGrid: React.FC = ({children}) => {
    let {grid: gridRef} = useContext(LayerContext)
    return gridRef.current ? createPortal(children, gridRef.current) : null
}

export const AsHeader: React.FC = ({children}) => {
    let {header: headerRef} = useContext(LayerContext)
    return headerRef.current ? createPortal(children, headerRef.current) : null
}

export const AsGroupLabels: React.FC = ({children}) => {
    let {groupLabels: groupLabelsRef} = useContext(LayerContext)
    return groupLabelsRef.current ? createPortal(children, groupLabelsRef.current) : null
}

export const AsGroupBackground: React.FC = ({children}) => {
    let {groupBackgrounds: groupBackgroundRef} = useContext(LayerContext)
    return groupBackgroundRef.current ? createPortal(children, groupBackgroundRef.current) : null
}

export const OnForeground: React.FC = ({children}) => {
    let {events: eventsRef} = useContext(LayerContext)
    return eventsRef.current ? createPortal(children, eventsRef.current) : null
}