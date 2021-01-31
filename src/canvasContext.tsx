import React, {RefObject, useContext} from 'react'
import {createPortal} from 'react-dom'

export const CanvasContext = React.createContext<{
    svg: RefObject<SVGSVGElement>
    grid: RefObject<SVGGElement>,
    header: RefObject<SVGGElement>,
    groupBackgrounds: RefObject<SVGGElement>
    groupLabels: RefObject<SVGGElement>
    events: RefObject<SVGGElement>
    groupLabelBackground: RefObject<SVGGElement>
}>(undefined!)


export const AsGrid: React.FC = ({children}) => {
    let {grid: gridRef} = useContext(CanvasContext)
    return gridRef.current ? createPortal(children, gridRef.current) : null
}

export const AsHeader: React.FC = ({children}) => {
    let {header: headerRef} = useContext(CanvasContext)
    return headerRef.current ? createPortal(children, headerRef.current) : null
}

export const AsGroupLabels: React.FC = ({children}) => {
    let {groupLabels: groupLabelsRef} = useContext(CanvasContext)
    return groupLabelsRef.current ? createPortal(children, groupLabelsRef.current) : null
}

export const AsGroupBackground: React.FC = ({children}) => {
    let {groupBackgrounds: groupBackgroundRef} = useContext(CanvasContext)
    return groupBackgroundRef.current ? createPortal(children, groupBackgroundRef.current) : null
}

export const OnForeground: React.FC = ({children}) => {
    let {events: eventsRef} = useContext(CanvasContext)
    return eventsRef.current ? createPortal(children, eventsRef.current) : null
}

export const AsGroupLabelBackground: React.FC = ({children}) => {
    let {groupLabels: groupLabelsRef} = useContext(CanvasContext)
    return <>
        {groupLabelsRef.current ? createPortal(children, groupLabelsRef.current) : null}
    </>
}