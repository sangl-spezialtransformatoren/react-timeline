import React, {useCallback, useEffect, useImperativeHandle} from 'react'
import create from 'zustand'
import createContext from "zustand/context"
import {usePrevious} from "./general"
import * as bigint from 'extra-bigint'

type Entry = {
    point: number,
    isEnd: boolean,
    key: string | number
}

let sortFunction = (a: Entry, b: Entry) => {
    let diff = a.point - b.point
    if (diff == 0) {
        let byEnd = (a.isEnd ? 0 : 1) - (b.isEnd ? 0 : 1)
        if (byEnd === 0) {
            return a.key > b.key ? 1 : -1
        } else {
            return byEnd
        }
    } else {
        return diff
    }
}

export type GroupStructure = {
    label: string,
    members: string[]
}[]

export type EventGroupStoreShape = {
    events: {[key: string]: {groupId: string, from: number, to: number}}
    eventPositions: Record<string, number>
    registerEvent: (_eventId: string, _groupId: string, _from: number, _to: number) => void
    unregisterEvent: (_eventId: string) => void
    updatePositions: () => void
    setGroupStructure: (_structure: GroupStructure) => void
}

const {
    Provider,
    useStore: useEventGroupStore,
    useStoreApi: useEventGroupStoreApi
} = createContext<EventGroupStoreShape>()

export {useEventGroupStore, useEventGroupStoreApi}

const createStore = () => create<EventGroupStoreShape>((set) => ({
    events: {},
    eventPositions: {},
    registerEvent: (eventId, groupId, from, to) => {
        set(state => ({events: {...state.events, [eventId]: {groupId, from, to}}}))
    },
    unregisterEvent: (eventId) => {
        set(state => ({events: Object.fromEntries(Object.entries(state.events).filter(([key, _]) => key !== eventId))}))
    },
    updatePositions: () => {
        set(state => {
            let groups: Record<string, {eventIds: string[], points: Entry[]}> = {}
            for (let [eventId, event] of Object.entries(state.events)) {
                groups[event.groupId] = {
                    eventIds: [...(groups?.[event.groupId]?.eventIds || []), eventId],
                    points: [
                        ...(groups?.[event.groupId]?.points || []),
                        {
                            key: eventId,
                            isEnd: false,
                            point: event.from
                        },
                        {
                            key: eventId,
                            isEnd: true,
                            point: event.to
                        }
                    ]
                }

            }
            let eventPositions: Record<string, number> = {}
            for (let group of Object.values(groups)) {
                let occupation = 0n
                let groupSet = group.points.sort(sortFunction)

                groupSet.forEach(({isEnd, key}: Entry) => {
                    if (isEnd) {
                        occupation = occupation & ~(2n ** BigInt(eventPositions[key]))
                    } else {
                        let firstFreeSlot = bigint.log2(~occupation & -~occupation)
                        eventPositions[key] = Number(firstFreeSlot)
                        occupation = occupation | (2n ** firstFreeSlot)
                    }
                })
            }
            return {
                eventPositions
            }
        })
    },
    setGroupStructure: () => {
        // pass
    }
}))

export type EventGroupStoreHandle = Record<string, unknown>

const EventGroupStoreAgent = React.forwardRef<EventGroupStoreHandle, Record<string, unknown>>((_, forwardRef) => {
    let events = useEventGroupStore(state => state.events)
    let updatePositions = useEventGroupStore(state => state.updatePositions)

    let previousEvents = usePrevious(events)

    useEffect(() => {
        if (events !== previousEvents) {
            updatePositions()
        }
    }, [events, previousEvents, updatePositions])

    useImperativeHandle(forwardRef, () => {
        return {}
    }, [])

    return <></>
})

EventGroupStoreAgent.displayName = "EventGroupStoreAgent"

export const EventGroupStoreProvider = React.forwardRef<EventGroupStoreHandle, Record<string, unknown>>(({children}, forwardRef) => {
    return <Provider createStore={createStore}>
        <EventGroupStoreAgent ref={forwardRef}/>
        {children}
    </Provider>
})

EventGroupStoreProvider.displayName = "EventGroupStoreProvider"

export const useEventGroupPosition = (eventId: string, groupId: string, from: number, to: number) => {
    let registerEvent = useEventGroupStore(state => state.registerEvent)
    let unregisterEvent = useEventGroupStore(state => state.unregisterEvent)

    useEffect(() => {
        registerEvent(eventId, groupId, from, to)
        return () => {
            unregisterEvent(eventId)
        }
    }, [eventId, groupId, from, to, registerEvent, unregisterEvent])


    let selector = useCallback((state: EventGroupStoreShape) => {
        return state.eventPositions?.[eventId]
    }, [eventId])

    return useEventGroupStore(selector)
}