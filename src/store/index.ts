import {EnhancedStore, Middleware, Reducer, ThunkDispatch} from '@reduxjs/toolkit'
import {Action, AnyAction} from 'redux'
import {BusinessLogic} from './businessLogic'
import {Actions, PayloadActions} from './actions'
import {useDispatch as useReduxDispatch, useSelector as useReduxSelector} from 'react-redux'
import {RequiredEventData, RequiredGroupData, StoreShape} from './shape'
import {useMemo} from 'react'
import {useBusinessLogic} from '../context'
import {createSelector as reselectCreateSelector} from 'reselect'

export type Dispatch<E extends RequiredEventData, G extends RequiredGroupData> = ThunkDispatch<StoreShape<E, G>, undefined, Actions>


export const createSelector = reselectCreateSelector


export function useSelector<E extends RequiredEventData, G extends RequiredGroupData, E_ extends {}, G_ extends {}, TSelected>(selector: (config: BusinessLogic<E, G, E_, G_>) => ((state: StoreShape<E, G>) => TSelected), equalityFn?: (left: TSelected, right: TSelected) => boolean): TSelected {
    let config = useBusinessLogic<E, G, E_, G_>()
    let memoizedSelector = useMemo(() => {
        return selector(config)
    }, [config])
    return useReduxSelector<StoreShape<E, G>, TSelected>(memoizedSelector, equalityFn)
}

export function useDispatch<E extends RequiredEventData, G extends RequiredGroupData>(): Dispatch<E, G> {
    return useReduxDispatch() as Dispatch<E, G>
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

export function createPayloadActionCreators<T extends PayloadActions['type'], D = ExtractAction<T>['payload']>(type: T, transformData?: (data: D) => ExtractAction<T>['payload']): [(data: D) => ExtractAction<T>, () => (data: D) => void] {
    let set = (data: D) => {
        return {
            type: type,
            payload: transformData ? transformData(data) : data,
        }
    }
    let useSet = () => {
        let dispatch = useDispatch()
        return (payload: D) => {
            // @ts-ignore
            dispatch(set(payload))
        }
    }
    // @ts-ignore
    return [set, useSet]
}
