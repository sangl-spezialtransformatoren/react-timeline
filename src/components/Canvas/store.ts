import {SpringRef, SpringValue} from '@react-spring/web'
import {createContext, useContext} from 'react'
import {createStore, useStore} from 'zustand'

type SpringType<T> = {
    [Property in keyof T]: SpringValue<T[Property]>;
}

type CanvasValues = {
    canvasWidth: number,
    canvasHeight: number,
    timeStart: number,
    timePerPixel: number
}

type SpringApi = {
    springApi: SpringRef<CanvasValues>
}

export type CanvasStoreShape = SpringApi & SpringType<CanvasValues>
type InitialCanvasStoreShape = SpringApi & SpringType<CanvasValues>

export type CanvasStore = ReturnType<typeof createCanvasStore>

export let createCanvasStore = (initialState: InitialCanvasStoreShape) => createStore<CanvasStoreShape>(() => ({
    ...initialState
}))

export const CanvasStoreContext = createContext<CanvasStore | null>(null)

export const useCanvasStore = <T, >(selector: (_: CanvasStoreShape) => T, equalityFn?: ((_a: T, _b: T) => boolean) | undefined) => {
    let store = useContext(CanvasStoreContext)
    if (!store) throw new Error('Context not set up!')
    return useStore(store, selector, equalityFn)
}

export const useCanvasStoreApi = () => {
    let store = useContext(CanvasStoreContext)
    if (!store) throw new Error('Context not set up!')
    return store
}

export const useTimeStart = () => {
    return useCanvasStore(state => state.timeStart)
}

export const useTimePerPixel = () => {
    return useCanvasStore(state => state.timePerPixel)
}
export const useCanvasHeight = () => {
    return useCanvasStore(state => state.canvasHeight)
}
export const useCanvasWidth = () => {
    return useCanvasStore(state => state.canvasWidth)
}