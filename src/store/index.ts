import {configureStore} from "@reduxjs/toolkit"
import {timeScale, TimeScaleState} from "./timeScale"
import {timeZone, TimeZoneState} from "./timeZone"
import {weekStartsOn, WeekStartsOnState} from "./weekStartsOn"
import {animate, AnimateState} from "./animate"
import {springConfig, SpringConfigState} from "./springConfig"
import {size, SizeState} from "./size"
import {initialized, InitializedState} from "./initialized"


export type StoreShape = {
    animate: AnimateState
    initialized: InitializedState
    size: SizeState
    springConfig: SpringConfigState
    timeScale: TimeScaleState
    timeZone: TimeZoneState
    weekStartsOn: WeekStartsOnState
}

export const timeLineStore = configureStore<StoreShape>({
    reducer: {
        animate,
        timeScale,
        timeZone,
        weekStartsOn,
        springConfig,
        size,
        initialized
    }
})


