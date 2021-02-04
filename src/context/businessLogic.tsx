import React, {createContext, useContext} from 'react'
import {BusinessLogic, DefaultBusinessLogic} from '../store/businessLogic'

export const BusinessLogicContext = createContext<BusinessLogic>(DefaultBusinessLogic)


export const TimelineBusinessLogic: React.FC<{ config: BusinessLogic }> = ({children, config}) => {
    return <>
        <BusinessLogicContext.Provider value={config}>
            {children}
        </BusinessLogicContext.Provider>
    </>
}

export const useBusinessLogic = () => {
    return useContext(BusinessLogicContext)
}