import React, {createContext, useContext} from 'react'
import {SpringValue, useSpring} from 'react-spring'
import {SpringConstant} from './defaults'
import {useAnimate, useInitialized, useSize, useStartDate, useTimePerPixel} from './store/selectors'
import {DefaultConfig, BusinessLogic} from './store/businessLogic'

export const StartDateSpringContext = createContext<SpringValue<Date | number>>(SpringConstant())
export const TimePerPixelSpringContext = createContext<SpringValue<number>>(SpringConstant())
export const BusinessLogicContext = createContext<BusinessLogic>(DefaultConfig)

const StartDateAnimationContext: React.FC = ({children}) => {
    let startDate = useStartDate()
    let width = useSize().width
    let animate = useAnimate()
    let initialized = useInitialized()


    let [{startDateSpring}] = useSpring(() => ({
        startDateSpring: startDate,
        immediate: !animate || !initialized,
    }), [startDate, width])

    return <>
        <StartDateSpringContext.Provider value={startDateSpring}>
            {children}
        </StartDateSpringContext.Provider>
    </>
}

const TimePerPixelAnimationContext: React.FC = ({children}) => {
    let timePerPixel = useTimePerPixel()
    let animate = useAnimate()
    let initialized = useInitialized()


    let [{timePerPixelSpring}] = useSpring(() => ({
        timePerPixelSpring: timePerPixel,
        immediate: !animate || !initialized,
    }), [timePerPixel])

    return <>
        <TimePerPixelSpringContext.Provider value={timePerPixelSpring}>
            {children}
        </TimePerPixelSpringContext.Provider>
    </>
}

const TimelineBusinessLogic: React.FC<{config: BusinessLogic}> = ({children, config}) => {
    return <>
        <BusinessLogicContext.Provider value={config}>
            {children}
        </BusinessLogicContext.Provider>
    </>
}

export const TimelineContext: React.FC<{businessLogic: BusinessLogic}> = ({businessLogic, children}) => {
    return <>
        <StartDateAnimationContext>
            <TimePerPixelAnimationContext>
                <TimelineBusinessLogic config={businessLogic}>
                    {children}
                </TimelineBusinessLogic>
            </TimePerPixelAnimationContext>
        </StartDateAnimationContext>
    </>
}

export const useStartDateSpring = () => {
    return useContext(StartDateSpringContext)
}

export const useTimePerPixelSpring = () => {
    return useContext(TimePerPixelSpringContext)
}

