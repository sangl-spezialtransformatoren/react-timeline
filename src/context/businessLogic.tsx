import React, {createContext, useContext} from 'react'
import {BusinessLogic, DefaultBusinessLogic} from '../store/businessLogic'
import {RequiredEventData, RequiredGroupData} from "../store/shape"

export const BusinessLogicContext = createContext<BusinessLogic<any, any, any, any>>(DefaultBusinessLogic)


export const TimelineBusinessLogic: React.FC<{config: BusinessLogic}> = ({children, config}) => {
    return <>
        <BusinessLogicContext.Provider value={config}>
            {children}
        </BusinessLogicContext.Provider>
    </>
}

export function useBusinessLogic<E extends RequiredEventData, G extends RequiredGroupData, E_ extends {}, G_ extends {}>() {
    return useContext(BusinessLogicContext) as BusinessLogic<E, G, E_, G_>
}