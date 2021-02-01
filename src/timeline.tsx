import React, {useEffect, useState} from 'react'
import {animated, to} from 'react-spring'
import {TimelineProps} from './definitions'
import {Provider} from 'react-redux'
import {TimelineStore} from './store'
import {TimelineContext, useStartDateSpring, useTimePerPixelSpring} from './context'
import {DefaultBusinessLogic} from './store/businessLogic'
import {createTimelineStore} from './store/reducers/root'
import './style.css'
import {TimelineCanvas} from './components/canvas'
import {useDateZero} from './store/hooks'
import {
    mergeNewEventData,
    mergeNewGroupData,
    setAnimate,
    setSpringConfig,
    setTimeZone,
    setWeekStartsOn,
    setLayoutParameters
} from './store/actions'
import isEqual from "react-fast-compare"


export const DragOffset: React.FC = ({children}) => {
    let startDateSpring = useStartDateSpring()
    let timePerPixelSpring = useTimePerPixelSpring()
    let dateZero = useDateZero()
    let offset = to([startDateSpring, timePerPixelSpring], (startDate, timePerPixel) => `translate(${(dateZero.valueOf() - startDate.valueOf()) / timePerPixel.valueOf()} 0)`)

    return <animated.g transform={offset}>
        {children}
    </animated.g>
}

export const SvgFilters: React.FC = () => {
    return <defs>
    </defs>
}


export const Timeline: React.FC<TimelineProps> = (props) => {
    let {
        animate,
        businessLogic,
        timeZone,
        weekStartsOn,
        springConfig,
        initialData,
        children,
        eventHeight,
        eventSpacing,
        groupPadding,
        minGroupHeight,
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
        if (initialData) {
            if (!isEqual(store?.getState()?.events, initialData.events)) {
                store?.dispatch?.(mergeNewEventData(initialData.events))
            }
            if (!isEqual(store?.getState()?.groups, initialData.groups)) {
                store?.dispatch?.(mergeNewGroupData(initialData.groups))
            }
        }
    }, [store, initialData])

    useEffect(() => {
        store?.dispatch(setLayoutParameters({
            eventHeight,
            eventSpacing,
            groupPadding,
            minGroupHeight
        }))
    }, [eventHeight, eventSpacing, groupPadding, minGroupHeight])


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
