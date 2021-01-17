import {StoreShape} from '../shape'
import {BusinessLogic} from '../businessLogic'
import {animate} from './animate'
import {events} from './events'
import {groups} from './groups'
import {timeScale} from './timeScale'
import {timeZone} from './timeZone'
import {weekStartsOn} from './weekStartsOn'
import {springConfig} from './springConfig'
import {size} from './size'
import {initialized} from './initialized'
import {combineConfigurableReducers, ConfigurableReducer, PartialReducer} from '../index'
import {configureStore} from '@reduxjs/toolkit'

export let partialReducers: { [K in keyof StoreShape]: ConfigurableReducer<PartialReducer<StoreShape, any, K>, BusinessLogic> } = {
    animate,
    events,
    groups,
    timeScale,
    timeZone,
    weekStartsOn,
    springConfig,
    size,
    initialized,
}

let combinedReducers = combineConfigurableReducers<StoreShape, any>(partialReducers)

export let rootReducer = (config: BusinessLogic) => {
    return combinedReducers(config)
}

export const createTimelineStore = (config: BusinessLogic, initialState?: StoreShape) => {
    return configureStore<StoreShape>({
        reducer: rootReducer(config),
        preloadedState: initialState,
    })
}