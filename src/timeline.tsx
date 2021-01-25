import React, {useEffect, useState} from 'react'
import {animated, to} from 'react-spring'
import {TimelineProps} from './definitions'
import {Provider} from 'react-redux'
import {TimelineStore} from './store'
import {TimelineContext, useStartDateSpring, useTimePerPixelSpring} from './context'
import {DefaultBusinessLogic} from './store/businessLogic'
import {createTimelineStore} from './store/reducers/root'
import './style.css'
import {TimelineCanvas} from './canvas'
import {useDateZero} from './store/hooks'
import {setAnimate, setSpringConfig, setTimeZone, setWeekStartsOn, mergeNewEventData} from "./store/actions"


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
        <filter id="dropshadow" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="0" result="offsetblur"/>
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
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
        springConfig && store?.dispatch?.(setSpringConfig(springConfig))
    }, [store, springConfig])

    useEffect(() => {
        initialData && store?.dispatch?.(mergeNewEventData(initialData.events))
    }, [store, initialData?.events])


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
