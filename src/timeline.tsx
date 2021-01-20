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
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="0" result="offsetblur" />
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    </defs>
}


export const Timeline_: React.FC<TimelineProps> = (props) => {
    let {config} = props
    let [store, setStore] = useState<TimelineStore<any>>()

    useEffect(() => {
        if (store) {
            let state = store.getState()
            setStore(createTimelineStore(config || DefaultBusinessLogic, state))
        } else {
            setStore(createTimelineStore(config || DefaultBusinessLogic))
        }
    }, [config])

    if (store) {
        return <Provider store={store}>
            <TimelineContext businessLogic={config || DefaultBusinessLogic}>
                <TimelineCanvas {...props} />
            </TimelineContext>
        </Provider>
    }
    return <></>
}

export const Timeline = React.memo(Timeline_)