import {RefObject, useEffect, useRef, useState} from "react"

type Size = { x: number, y: number, width: number, height: number }
export const useResizeObserver = <E extends SVGElement | HTMLElement, >() => {
    let ref = useRef<E>(null)
    let [size, setSize] = useState<Size>()
    let observer = useRef(new ResizeObserver(entries => {
        let firstEntry = entries[0]
        let bbox = firstEntry.target.getBoundingClientRect()
        setSize(() => ({
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height,
        }))
    }))

    useEffect(() => {
        if (ref.current) {
            observer.current.observe(ref.current)
        }
        return () => {
            observer.current.disconnect()
        }
    }, [ref])

    return [ref, size] as [RefObject<E>, Size]
}
