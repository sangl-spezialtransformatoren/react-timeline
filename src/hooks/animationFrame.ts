import {useCallback, useEffect, useRef} from "react"

export const useAnimationFrame = (callback: (_deltaTime?: number) => unknown) => {
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = useRef<number | undefined>()
    const previousTimeRef = useRef<number | undefined>()

    const animate = useCallback((time: number) => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current
            callback(deltaTime)
        }
        previousTimeRef.current = time
        requestRef.current = requestAnimationFrame(animate)
    }, [callback])

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate)
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current)
            }
        }
    }, [animate]) // Make sure the effect runs only once
}