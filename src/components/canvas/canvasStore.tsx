import create from 'zustand'
import createContext from 'zustand/context'
import React, {RefObject, useContext, useEffect, useImperativeHandle} from 'react'
import {SpringRef, SpringValue, to, useSpring} from '@react-spring/web'
import {round} from '../../functions/round'
import {usePrevious} from '../../hooks/general'

export type CanvasStoreShape = {
    containerRef?: RefObject<HTMLDivElement>
    containerWidth: number
    containerHeight: number
    containerLeft: number
    scrollContainerHeights: Record<string, number>
    scrollOffset: number
    timeZero: number
    timePerPixel: number
    timePerPixelAnchor: number
    timeStart: number
    realignmentCounter: number
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
    idle: boolean
    setIdle: (_: boolean) => void
    setContainerRef: (_: RefObject<HTMLDivElement>) => void
}

const createCanvasStore = () => create<CanvasStoreShape>(set => ({
    containerRef: undefined,
    containerWidth: 600,
    containerHeight: 400,
    containerLeft: 0,
    scrollContainerHeights: {},
    scrollOffset: 0,
    timeZero: new Date().valueOf(),
    timePerPixel: 172800,
    timePerPixelAnchor: 172800,
    timeStart: new Date().valueOf(),
    realignmentCounter: 0,
    idle: true,
    setContainerWidth: (containerWidth: number) => set(({containerWidth: round(containerWidth)})),
    setContainerHeight: (containerHeight: number) => set(state => {
        let scrollOffset = state.scrollOffset
        let contentHeight = Math.max(...Object.values(state.scrollContainerHeights))
        scrollOffset = Math.max(0, scrollOffset)
        scrollOffset = Math.min(scrollOffset, Math.max(contentHeight - state.containerHeight + 10, 0))
        scrollOffset = round(scrollOffset)
        return {
            containerHeight: round(containerHeight),
            scrollOffset
        }
    }),
    setContainerLeft: (containerLeft: number) => set({containerLeft}),
    setScrollContainerHeight: (containerId, contentHeight: number) => set(state => ({
        scrollContainerHeights: {...state.scrollContainerHeights, containerId: contentHeight}
    })),
    unregisterScrollContainer: (containerId) => set(state => ({
        scrollContainerHeights: Object.fromEntries(Object.entries(state.scrollContainerHeights).filter(([key, _]) => key !== containerId))
    })),
    setScrollOffset: (scrollOffset: number) => set(state => {
        let contentHeight = Math.max(...Object.values(state.scrollContainerHeights))
        scrollOffset = Math.max(0, scrollOffset)
        scrollOffset = Math.min(scrollOffset, Math.max(contentHeight - state.containerHeight + 10, 0))
        scrollOffset = round(scrollOffset)
        return {
            scrollOffset
        }
    }),
    setTimeZero: (timeZero: number) => set({timeZero}),
    setTimePerPixel: (timePerPixel: number) => set({timePerPixel}),
    setTimeStart: (timeStart: number) => set({timeStart}),
    setTimePerPixelAnchor: (timePerPixelAnchor: number) => set({timePerPixelAnchor}),
    realign: () => set(state => {
        return {
            timePerPixelAnchor: state.timePerPixel,
            timeZero: state.timeStart,
            realignmentCounter: (state.realignmentCounter + 1) % 1000
        }
    }),
    setIdle: (idle: boolean) => set({idle}),
    setContainerRef: (containerRef: RefObject<HTMLDivElement>) => set({containerRef})
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
    let setIdle = useCanvasStore(state => state.setIdle)

    let timeStart = useTimeStart()
    let timePerPixel = useTimePerPixel()
    let timeZero = useTimeZero()
    let timePerPixelAnchor = useTimePerPixelAnchor()

    let realign = useRealign()

    // Realign points when dragging or scaling away to avoid discretization issues
    useEffect(() => {
        if ((Math.abs((timeStart.valueOf() - timeZero.valueOf()) / timePerPixel) > 1500) || Math.abs(Math.log(timePerPixel / timePerPixelAnchor)) > 0.5) {
            realign()
        }
    }, [timeStart, timeZero, timePerPixel, timePerPixelAnchor, setTimeZero, setTimePerPixelAnchor, realign])

    // Animations
    let [_, api] = useSpring(() => ({
        timeStartSpring: timeStart,
        timePerPixelSpring: timePerPixel,
        scrollOffsetSpring: scrollOffset,
        onStart: () => setIdle(false),
        config: {
            mass: 1,
            tension: 210,
            friction: 29,
            round: 0.1,
            precision: 0.1
        }
    }))

    useEffect(() => {
        api.update({
            timeStartSpring: timeStart,
            timePerPixelSpring: timePerPixel,
            scrollOffsetSpring: scrollOffset
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
CanvasAgent.displayName = 'CanvasAgent'

export const CanvasStoreProvider = React.forwardRef<CanvasStoreHandle, Record<string, unknown>>(({children}, forwardedRef) => {
    return <Provider createStore={createCanvasStore}>
        <CanvasAgent ref={forwardedRef}>
            {children}
        </CanvasAgent>
    </Provider>
})

CanvasStoreProvider.displayName = 'CanvasStoreProvider'

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

export const useRealignmentCounter = () => {
    return useCanvasStore(state => state.realignmentCounter)
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


let idleSelector = (state: CanvasStoreShape) => state.idle
export const useIsIdle = () => {
    return useCanvasStore(idleSelector)
}

export const useTimelyTransform = () => {
    let timeZero = useTimeZero()
    let timePerPixelAnchor = useTimePerPixelAnchor()

    let timeStartSpring = useTimeStartSpring()
    let timePerPixelSpring = useTimePerPixelSpring()

    let timeOffset = to([timeStartSpring, timePerPixelSpring, timeZero], (timeStart, timePerPixel) => `${round((timeZero - timeStart) / timePerPixel)}px 0`)
    let transform = to([timeStartSpring, timePerPixelSpring, timeZero, timePerPixelAnchor], (timeStart, timePerPixel, timeZero, timePerPixelAnchor) => {
        let timeScaling = timePerPixelAnchor / timePerPixel
        let timeOffset = round((timeZero - timeStart) / timePerPixel)
        return `translateX(${round(timeOffset * timeScaling)}px) scaleX(${timeScaling})`
    })


    return {
        transform: transform,
        transformOrigin: timeOffset
    }
}