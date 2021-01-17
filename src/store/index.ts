import {EnhancedStore, Middleware, Reducer} from '@reduxjs/toolkit'
import {Action, AnyAction, Dispatch as ReduxDispatch} from 'redux'
import {BusinessLogic} from './businessLogic'
import {Actions, PayloadActions} from './actions'
import {useDispatch as useReduxDispatch, useSelector as useReduxSelector} from 'react-redux'
import {StoreShape} from './shape'
import {useContext} from 'react'
import {BusinessLogicContext} from '../context'

export type Dispatch = ReduxDispatch<Actions>

export function useSelector<TSelected>(selector: (config: BusinessLogic) => ((state: StoreShape) => TSelected), equalityFn?: (left: TSelected, right: TSelected) => boolean): TSelected {
    let config = useContext(BusinessLogicContext)
    return useReduxSelector<StoreShape, TSelected>(selector(config), equalityFn)
}

export function useDispatch(): Dispatch {
    return useReduxDispatch() as Dispatch
}

type NonDefaultReducer<S = any, A extends Action = AnyAction> = (
    state: S,
    action: A,
) => S


export type ConfigurableReducer<T extends Reducer<any, any>, C> = (config: C) => T

export type GlobalReducer = NonDefaultReducer<StoreShape>

export type PartialReducer<S extends {[k: string]: any}, A extends Action, K extends keyof S> = (state: S | undefined, action: A) => S[K]

export type PartialTimelineReducer<T extends keyof StoreShape> = ConfigurableReducer<PartialReducer<StoreShape, Actions, T>, BusinessLogic>
export type TimelineReducer = ConfigurableReducer<Reducer<StoreShape, Actions>, BusinessLogic>

export type PayloadAction<T, V> = {
    type: T,
    payload: V
}


export function combineConfigurableReducers<S extends {[k: string]: any}, A extends Action>(reducers: { [K in keyof S]: ConfigurableReducer<PartialReducer<S, A, K>, BusinessLogic> }): TimelineReducer {
    return (config) => {
        return (state, action) => {
            let result = Object.fromEntries(
                Object.entries(reducers).map(
                    ([key, reducer]) => {
                        return [key, reducer(config)(state, action)]
                    }),
            )
            return result as StoreShape
        }
    }

}


export type TimelineStore<M extends ReadonlyArray<Middleware<{}, StoreShape>>> = EnhancedStore<StoreShape, AnyAction, M>


type ExtractAction_<T extends PayloadActions['type'], U extends PayloadActions> = Extract<PayloadActions, U extends {type: T} ? U : never>
type ExtractAction<T extends PayloadActions['type']> = ExtractAction_<T, PayloadActions>

export function createPayloadActionCreators<T extends PayloadActions['type'], D = ExtractAction<T>['payload']>(type: T, transformData?: (data: D) => ExtractAction<T>['payload']): [(dispatch: Dispatch, data: D) => void, () => (data: D) => void] {
    let set = (dispatch: Dispatch, data: D) => {
        let action = {
            type: type,
            payload: transformData ? transformData(data) : data,
        }
        // @ts-ignore
        dispatch(action)
    }
    let useSet = () => {
        let dispatch = useDispatch()
        return (payload: D) => {
            set(dispatch, payload)
        }
    }
    // @ts-ignore
    return [set, useSet]
}