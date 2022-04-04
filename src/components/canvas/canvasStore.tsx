import create from "zustand"
import createContext from "zustand/context"
import React, {useContext, useEffect, useImperativeHandle} from "react"
import {SpringRef, SpringValue, to, useSpring} from "@react-spring/web"
import {round} from "../../functions/round"

export type CanvasStoreShape = {
    containerWidth: number
    containerHeight: number
    containerLeft: number
    scrollContainerHeights: Record<string, number>
    scrollOffset: number
    timeZero: number
    timePerPixel: number
    timePerPixelAnchor: number
    timeStart: number
    setContainerWidth: (_: number) => void
    setContainerHeight: (_: number) => void
    setContainerLeft: (_: number) => void
    setScrollContainerHeight: (_scrollContainerId: string, _height: number) => void
    unregisterScrollContainer: (_scrollContainerId: string) => void
    setScrollOffset: (_: number) => void
    setTimeZero: (_: number) => void
    setTimePerPixel: (_: number) => void
    setTimePerPixelAnchor: (_: number) => void
    setTimeStart: (_: number) => void
    realign: () => void
}

const createCanvasStore = () => create<CanvasStoreShape>(set => ({
    containerWidth: 600,
    containerHeight: 400,
    containerLeft: 0,
    scrollContainerHeights: {},
    scrollOffset: 0,
    timeZero: new Date().valueOf(),
    timePerPixel: 172800,
    timePerPixelAnchor: 172800,
    timeStart: new Date().valueOf(),
    setContainerWidth: (containerWidth: number) => set(state => ({...state, containerWidth: round(containerWidth)})),
    setContainerHeight: (containerHeight: number) => set(state => {
        let scrollOffset = state.scrollOffset
        let contentHeight = Math.max(...Object.values(state.scrollContainerHeights))
        scrollOffset = Math.max(0, scrollOffset)
        scrollOffset = Math.min(scrollOffset, Math.max(contentHeight - state.containerHeight + 10, 0))
        scrollOffset = round(scrollOffset)
        return {
            ...state,
            containerHeight: round(containerHeight),
            scrollOffset
        }
    }),
    setContainerLeft: (containerLeft: number) => set(state => ({...state, containerLeft})),
    setScrollContainerHeight: (containerId, contentHeight: number) => set(state => ({
        ...state,
        scrollContainerHeights: {...state.scrollContainerHeights, containerId: contentHeight}
    })),
    unregisterScrollContainer: (containerId) => set(state => ({
        ...state,
        scrollContainerHeights: Object.fromEntries(Object.entries(state.scrollContainerHeights).filter(([key, _]) => key !== containerId))
    })),
    setScrollOffset: (scrollOffset: number) => set(state => {
        let contentHeight = Math.max(...Object.values(state.scrollContainerHeights))
        scrollOffset = Math.max(0, scrollOffset)
        scrollOffset = Math.min(scrollOffset, Math.max(contentHeight - state.containerHeight + 10, 0))
        scrollOffset = round(scrollOffset)
        return {
            ...state,
            scrollOffset
        }
    }),
    setTimeZero: (timeZero: number) => set(state => ({...state, timeZero})),
    setTimePerPixel: (timePerPixel: number) => set(state => ({...state, timePerPixel})),
    setTimeStart: (timeStart: number) => set(state => ({...state, timeStart})),
    setTimePerPixelAnchor: (timePerPixelAnchor: number) => set(state => ({...state, timePerPixelAnchor})),
    realign: () => set(state => {
        return {
            ...state,
            timePerPixelAnchor: state.timePerPixel,
            timeZero: state.timeStart
        }
    })
}))

const {Provider, useStore: useCanvasStore, useStoreApi: useCanvasStoreApi} = createContext<CanvasStoreShape>()

export type CanvasStoreHandle = {
    setTimeStart: (_: number) => void
    setTimePerPixel: (_: number) => void
}

// eslint-disable-next-line react-hooks/rules-of-hooks
export const SpringContext = React.createContext<SpringRef<{timeStartSpring: number; timePerPixelSpring: number; scrollOffsetSpring: number;}> | undefined>(undefined)

const CanvasAgent = React.forwardRef<CanvasStoreHandle, Record<string, unknown>>(({children}, forwardRef) => {
    let setTimeStart = useCanvasStore(state => state.setTimeStart)
    let setTimeZero = useCanvasStore(state => state.setTimeZero)
    let setTimePerPixel = useCanvasStore(state => state.setTimePerPixel)
    let setTimePerPixelAnchor = useCanvasStore(state => state.setTimePerPixelAnchor)
    let scrollOffset = useCanvasStore(state => state.scrollOffset)

    let timeStart = useTimeStart()
    let timePerPixel = useTimePerPixel()
    let timeZero = useTimeZero()
    let timePerPixelAnchor = useTimePerPixelAnchor()

    let realign = useRealign()

    // Realign points when dragging or scaling away to avoid discretization issues
    useEffect(() => {
        if ((Math.abs((timeStart.valueOf() - timeZero.valueOf()) / timePerPixel) > 1000) || Math.abs(Math.log(timePerPixel / timePerPixelAnchor)) > 0.13) {
            realign()
        }
    }, [timeStart, timeZero, timePerPixel, timePerPixelAnchor, setTimeZero, setTimePerPixelAnchor, realign])

    // Animations
    let [_, api] = useSpring(() => ({
        timeStartSpring: timeStart,
        timePerPixelSpring: timePerPixel,
        scrollOffsetSpring: scrollOffset,
        onRest: realign,
        config: {
            mass: 1,
            tension: 210,
            friction: 29,
            clamp: true,
        }
    }))

    useEffect(() => {
        api.update({
            timeStartSpring: timeStart,
            timePerPixelSpring: timePerPixel,
            scrollOffsetSpring: scrollOffset,
        })
        api.start()
    }, [api, scrollOffset, timePerPixel, timeStart])

    useImperativeHandle(forwardRef, () => {
        return {
            setTimeStart: (timeStart) => {
                setTimeStart(timeStart)
                setTimeZero(timeStart)
            },
            setTimePerPixel: (timePerPixel) => {
                setTimePerPixel(timePerPixel)
                setTimePerPixelAnchor(timePerPixel)
            }
        }
    }, [setTimePerPixel, setTimePerPixelAnchor, setTimeStart, setTimeZero])

    return <SpringContext.Provider value={api}>
        {children}
    </SpringContext.Provider>
})
CanvasAgent.displayName = "CanvasAgent"

export const CanvasStoreProvider = React.forwardRef<CanvasStoreHandle, Record<string, unknown>>(({children}, forwardedRef) => {
    return <Provider createStore={createCanvasStore}>
        <CanvasAgent ref={forwardedRef}>
            {children}
        </CanvasAgent>
    </Provider>
})

CanvasStoreProvider.displayName = "CanvasStoreProvider"

export {useCanvasStore, useCanvasStoreApi}

export const useTimeZero = () => {
    return useCanvasStore(state => state.timeZero)
}

export const useTimeStart = () => {
    return useCanvasStore(state => state.timeStart)
}

export const useTimePerPixel = () => {
    return useCanvasStore(state => state.timePerPixel)
}

export const useTimePerPixelAnchor = () => {
    return useCanvasStore(state => state.timePerPixelAnchor)
}

export const useCanvasHeight = () => {
    return useCanvasStore(state => state.containerHeight)
}

export const useCanvasWidth = () => {
    return useCanvasStore(state => state.containerWidth)
}

export const useCanvasOffsetLeft = () => {
    return useCanvasStore(state => state.containerLeft)
}

export const useRealign = () => {
    return useCanvasStore(state => state.realign)
}

export const useTimeStartSpring = () => {
    let controller = useContext(SpringContext)
    return controller?.current?.[0]?.springs.timeStartSpring || new SpringValue(0)
}

export const useTimePerPixelSpring = () => {
    let controller = useContext(SpringContext)
    return controller?.current?.[0]?.springs.timePerPixelSpring || new SpringValue(1)
}

export const useScrollOffsetSpring = () => {
    let controller = useContext(SpringContext)
    return controller?.current?.[0]?.springs.scrollOffsetSpring || new SpringValue(0)
}

export const useTimelyTransform = () => {
    useTimeStart()
    useTimePerPixel()
    let timeZero = useTimeZero()
    let timePerPixelAnchor = useTimePerPixelAnchor()

    let timeStartSpring = useTimeStartSpring()
    let timePerPixelSpring = useTimePerPixelSpring()

    let timeOffset = to([timeStartSpring, timePerPixelSpring], (timeStart, timePerPixel) => `${(timeZero - timeStart) / timePerPixel}px 0`)

    let transform = to([timeStartSpring, timePerPixelSpring], (timeStart, timePerPixel) => {
        let timeOffset = round((timeZero - timeStart) / timePerPixel)
        let timeScaling = timePerPixelAnchor / timePerPixel
        return `translate3d(${round(timeOffset * timeScaling)}px, 0, 0) scale3d(${timeScaling}, 1, 1)`
    })

    return {
        transform: transform,
        transformOrigin: timeOffset
    }
}