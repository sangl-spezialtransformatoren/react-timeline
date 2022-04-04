import create from "zustand"
import createContext from "zustand/context"
import React, {useContext, useEffect, useImperativeHandle} from "react"
import {SpringRef, SpringValue, to, useSpring} from "@react-spring/web"

export type CanvasStoreShape = {
    width: number
    height: number
    offsetLeft: number
    timeZero: number
    timePerPixel: number
    timePerPixelAnchor: number
    timeStart: number
    setWidth: (_: number) => unknown
    setHeight: (_: number) => unknown
    setOffsetLeft: (_: number) => unknown
    setTimeZero: (_: number) => unknown
    setTimePerPixel: (_: number) => unknown
    setTimePerPixelAnchor: (_: number) => unknown
    setTimeStart: (_: number) => unknown,
    realign: () => unknown
}

const createCanvasStore = () => create<CanvasStoreShape>(set => ({
    width: 600,
    height: 400,
    offsetLeft: 0,
    timeZero: new Date().valueOf(),
    timePerPixel: 172800,
    timePerPixelAnchor: 172800,
    timeStart: new Date().valueOf(),
    setWidth: (width: number) => set(state => ({...state, width})),
    setHeight: (height: number) => set(state => ({...state, height})),
    setOffsetLeft: (offsetLeft: number) => set(state => ({...state, offsetLeft})),
    setTimeZero: (timeZero: number) => set(state => ({...state, timeZero})),
    setTimePerPixel: (timePerPixel: number) => set(state => ({...state, timePerPixel})),
    setTimeStart: (timeStart: number) => set(state => ({...state, timeStart})),
    setTimePerPixelAnchor: (timePerPixelAnchor: number) => set(state => ({...state, timePerPixelAnchor})),
    realign: () => set(state => {
        return {...state, timePerPixelAnchor: state.timePerPixel, timeZero: state.timeStart}
    }),
}))

const {Provider, useStore: useCanvasStore, useStoreApi: useCanvasStoreApi} = createContext<CanvasStoreShape>()

export type CanvasStoreHandle = {
    setTimeStart: (_: number) => void
    setTimePerPixel: (_: number) => void
}

// eslint-disable-next-line react-hooks/rules-of-hooks
export const SpringContext = React.createContext<SpringRef<{timeStartSpring: number; timePerPixelSpring: number;}> | undefined>(undefined)

const CanvasAgent = React.forwardRef<CanvasStoreHandle, Record<string, unknown>>(({children}, forwardRef) => {
    let setTimeStart = useCanvasStore(state => state.setTimeStart)
    let setTimeZero = useCanvasStore(state => state.setTimeZero)
    let setTimePerPixel = useCanvasStore(state => state.setTimePerPixel)
    let setTimePerPixelAnchor = useCanvasStore(state => state.setTimePerPixelAnchor)

    let timeStart = useTimeStart()
    let timePerPixel = useTimePerPixel()

    let realign = useRealign()

    // Animations
    let [_, api] = useSpring(() => ({
        timeStartSpring: timeStart,
        timePerPixelSpring: timePerPixel,
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
            timePerPixelSpring: timePerPixel
        })
        api.start()
    }, [api, timePerPixel, timeStart])

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
    return useCanvasStore(state => state.height)
}

export const useCanvasWidth = () => {
    return useCanvasStore(state => state.width)
}

export const useCanvasOffsetLeft = () => {
    return useCanvasStore(state => state.offsetLeft)
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

export const useTimelyTransform = () => {
    useTimeStart()
    useTimePerPixel()
    let timeZero = useTimeZero()
    let timePerPixelAnchor = useTimePerPixelAnchor()

    let timeStartSpring = useTimeStartSpring()
    let timePerPixelSpring = useTimePerPixelSpring()

    let timeOffset = to([timeStartSpring, timePerPixelSpring], (timeStart, timePerPixel) => `${(timeZero - timeStart) / timePerPixel}px 0`)

    let transform = to([timeStartSpring, timePerPixelSpring], (timeStart, timePerPixel) => {
        let timeOffset = (timeZero - timeStart) / timePerPixel
        let timeScaling = timePerPixelAnchor / timePerPixel
        return `translate3d(${timeOffset * timeScaling}px, 0, 0) scale3d(${timeScaling}, 1, 1)`
    })

    return {
        transform: transform,
        transformOrigin: timeOffset
    }
}