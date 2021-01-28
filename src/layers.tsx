import React, {RefObject, useContext, useEffect, useRef} from 'react'
import {useSetHeaderHeight} from './store/actions'
import {useResizeObserver} from './hooks'
import {useSize} from './store/hooks'
import {createPortal} from 'react-dom'
import Scrollbars from "react-custom-scrollbars"

export const LayerContext = React.createContext<{
    grid: RefObject<SVGGElement>,
    header: RefObject<SVGGElement>,
    groupBackgrounds: RefObject<SVGGElement>
    groupLabels: RefObject<SVGGElement>
    events: RefObject<SVGGElement>
    innerSvg: RefObject<SVGSVGElement>
    groupLabelBackground: RefObject<SVGGElement>
}>(undefined!)


export const TimelineLayers: React.FC = ({children}) => {
    // Refs
    let gridRef = useRef<SVGGElement>(null)
    let groupBackgroundsRef = useRef<SVGGElement>(null)
    let groupLabelsRef = useRef<SVGGElement>(null)
    let scrollRef = useRef<SVGRectElement>(null)
    let innerSvgRef = useRef<SVGSVGElement>(null)
    let headerRef = useRef<SVGGElement>(null)
    let eventsRef = useRef<SVGGElement>(null)
    let groupLabelBackgroundRef = useRef<SVGGElement>(null)

    // Resize Observers
    let {height: headerHeight} = useResizeObserver<SVGGElement>(headerRef)
    let {height: groupBackgroundsHeight} = useResizeObserver<SVGGElement>(groupBackgroundsRef)

    let {width, height} = useSize()
    let setHeaderHeight = useSetHeaderHeight()


    useEffect(() => {
        setHeaderHeight(headerHeight)
    }, [headerHeight])

    return <LayerContext.Provider value={{
        grid: gridRef,
        header: headerRef,
        groupBackgrounds: groupBackgroundsRef,
        groupLabels: groupLabelsRef,
        events: eventsRef,
        innerSvg: innerSvgRef,
        groupLabelBackground: groupLabelBackgroundRef
    }}>
        <g id={'grid'} ref={gridRef}/>
        {
            //Mask background so that the pinch event is handled correctly
        }
        <g id={'group-label-background'} ref={groupLabelBackgroundRef}/>
        <g id={'header'} ref={headerRef}/>
        <foreignObject x={0} y={headerHeight} width={width} height={height - headerHeight}>
            <Scrollbars>
                <svg style={{width: '100%', height: groupBackgroundsHeight}} ref={innerSvgRef}>
                    <g id={'group-backgrounds'} ref={groupBackgroundsRef} mask={"url(#mask)"}/>
                    <rect width={width} height={height - headerHeight} fill={'transparent'}
                          ref={scrollRef}/>
                    <g id={'events'} ref={eventsRef} mask={"url(#mask)"}/>
                    <g id={'group-labels'} ref={groupLabelsRef}/>
                </svg>
            </Scrollbars>
        </foreignObject>
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

export const AsGroupLabelBackground: React.FC = ({children}) => {
    let {groupLabels: groupLabelsRef, groupLabelBackground: groupLabelBackgroundRef} = useContext(LayerContext)
    return <>
        {groupLabelBackgroundRef.current ? createPortal(children, groupLabelBackgroundRef.current) : null}
        {groupLabelsRef.current ? createPortal(children, groupLabelsRef.current) : null}
    </>
}