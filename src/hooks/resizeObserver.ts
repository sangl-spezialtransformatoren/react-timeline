import {RefObject, useEffect, useLayoutEffect} from "react"

export const useResizeObserver = (ref: RefObject<HTMLDivElement>, handler: (_: {
    width: number,
    height: number
}) => void) => {
    useLayoutEffect(() => {
        if (ref.current) {
            handler({width: ref.current.clientWidth, height: ref.current.clientHeight})
        }
    }, [handler, ref])

    useEffect(() => {
        if (ref.current) {
            let callback: ResizeObserverCallback = (entries) => {
                let entry = entries?.[0]
                if (!entry) {
                    throw Error
                }
                handler({width: entry.contentRect.width, height: entry.contentRect.height})
            }
            let observer = new ResizeObserver(callback)
            observer.observe(ref.current)
            return () => {
                observer.disconnect()
            }
        }
    }, [handler, ref])
}