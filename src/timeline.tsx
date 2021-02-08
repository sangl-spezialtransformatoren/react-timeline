import React, {useEffect, useState} from 'react'
import {DefaultTimelineProps, TimelineProps} from './definitions'
import {Provider} from 'react-redux'
import {TimelineStore} from './store'
import {TimelineContext} from './context'
import {DefaultBusinessLogic} from './store/businessLogic'
import {createTimelineStore} from './store/reducers/root'
import './style.css'
import {TimelineCanvas} from './components/canvas'
import {
    mergeNewEventData,
    mergeNewGroupData,
    setAnimate,
    setLayoutParameters,
    setSpringConfig,
    setTimeZone,
    setWeekStartsOn,
} from './store/actions'
import isEqual from 'react-fast-compare'


export const Timeline: React.FC<TimelineProps> = (props = DefaultTimelineProps) => {
    let {
        animate,
        businessLogic,
        timeZone,
        weekStartsOn,
        springConfig,
        children,
        eventHeight,
        eventSpacing,
        groupPadding,
        minGroupHeight,
        drawerWidth,
        events,
        groups,
        ...otherProps
    } = props

    let [store, setStore] = useState<TimelineStore<any>>()


    useEffect(() => {
        if (store) {
            let state = store.getState()
            setStore(createTimelineStore(businessLogic || DefaultBusinessLogic, state))
        } else {
            setStore(createTimelineStore(businessLogic || DefaultBusinessLogic))
        }
    }, [businessLogic])

    useEffect(() => {
        (animate !== undefined) && store?.dispatch?.(setAnimate(animate))
    }, [store, animate])

    useEffect(() => {
        timeZone && store?.dispatch?.(setTimeZone(timeZone))
    }, [store, timeZone])

    useEffect(() => {
        (weekStartsOn !== undefined) && store?.dispatch?.(setWeekStartsOn(weekStartsOn))
    }, [store, weekStartsOn])

    useEffect(() => {
        if (!isEqual(springConfig, store?.getState().springConfig)) {
            springConfig && store?.dispatch?.(setSpringConfig(springConfig))
        }
    }, [store, springConfig])

    useEffect(() => {
        if (events) {
            if (!isEqual(store?.getState()?.events, events)) {
                store?.dispatch?.(mergeNewEventData(events))
            }
        }
    }, [store, events])

    useEffect(() => {
        if (groups) {
            if (!isEqual(store?.getState()?.groups, groups)) {
                store?.dispatch?.(mergeNewGroupData(groups))
            }
        }
    }, [store, groups])

    useEffect(() => {
        store?.dispatch(setLayoutParameters({
            eventHeight,
            eventSpacing,
            groupPadding,
            minGroupHeight
        }))
    }, [eventHeight, eventSpacing, groupPadding, minGroupHeight, drawerWidth])


    if (store) {
        return <Provider store={store}>
            <TimelineContext businessLogic={businessLogic || DefaultBusinessLogic}>
                <TimelineCanvas {...otherProps}>
                    {children}
                </TimelineCanvas>
            </TimelineContext>
        </Provider>
    }
    return <></>
}
