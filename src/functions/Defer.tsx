import React, {Children, useEffect, useMemo, useState} from "react"
import 'requestidlecallback-polyfill';

export const Defer: React.FC<{chunkSize: number}> = ({chunkSize, children}) => {
    const [renderedItemsCount, setRenderedItemsCount] = useState(chunkSize)

    const childrenArray = useMemo(() => Children.toArray(children), [
        children
    ])

    useEffect(() => {
        if (renderedItemsCount < childrenArray.length) {
            window.requestIdleCallback(
                () => {
                    setRenderedItemsCount(
                        Math.min(renderedItemsCount + chunkSize, childrenArray.length)
                    )
                },
                {timeout: 200}
            )
        }
    }, [renderedItemsCount, childrenArray.length, chunkSize])

    return <>{childrenArray.slice(0, renderedItemsCount)}</>
}