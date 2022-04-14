import React, {MutableRefObject, useCallback, useContext, useEffect, useImperativeHandle, useRef} from 'react'
import create from 'zustand'
import createContext from "zustand/context"
import * as bigint from "extra-bigint"
import 'requestidlecallback-polyfill';

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

export function calculatePositions(groupSet: Entry[]): [Record<string, number>, number] {
    let positions: Record<string, number> = {}
    let occupation = 0n
    let size = 0

    groupSet.forEach(({isEnd, key}: Entry) => {
        if (isEnd) {
            occupation = occupation & ~(2n ** BigInt(positions[key]))
        } else {
            let firstFreeSlot = bigint.log2(~occupation & -~occupation)
            let positonAsNumber = Number(firstFreeSlot)
            positions[key] = positonAsNumber
            if (positonAsNumber > size) {
                size = positonAsNumber
            }
            occupation = occupation | (2n ** firstFreeSlot)
        }
    })
    return [positions, size]
}

type EventStore = {
    events: Record<string, {from: number, to: number, groupId: string}>
    dirtyGroups: Set<string>
    changes: ({action: 'delete', eventId: string} | {action: 'set', eventId: string, from: number, to: number, groupId: string})[]
}

export const EventStoreContext = React.createContext<MutableRefObject<EventStore> | undefined>(undefined)

export const useEventStore = () => {
    return useContext(EventStoreContext)
}


export type EventGroupStoreShape = {
    eventPositions: Record<string, number>
    groupSizes: Record<string, number>
    updateEventPositions: (_: Record<string, number>) => void
    updateGroupSizes: (_: Record<string, number>) => void
}

const {
    Provider,
    useStore: useEventGroupStore,
    useStoreApi: useEventGroupStoreApi
} = createContext<EventGroupStoreShape>()

export {useEventGroupStore, useEventGroupStoreApi}


const createStore = () => create<EventGroupStoreShape>((set) => ({
    eventPositions: {},
    groupSizes: {},
    updateEventPositions: (eventPositions) => set(state => ({eventPositions: {...state.eventPositions, ...eventPositions}})),
    updateGroupSizes: (groupSizes) => set(state => ({groupSizes: {...state.groupSizes, ...groupSizes}})),
}))

export type EventGroupStoreHandle = Record<string, unknown>

const EventGroupStoreAgent = React.forwardRef<EventGroupStoreHandle, Record<string, unknown>>((_, forwardRef) => {
    useImperativeHandle(forwardRef, () => {
        return {}
    }, [])

    let eventStore = useEventStore()

    let updateEventPositions = useEventGroupStore(state => state.updateEventPositions)
    let updateGroupSizes = useEventGroupStore(state => state.updateGroupSizes)

    useEffect(() => {
        let callback = () => {
            if (eventStore?.current && eventStore.current.changes.length > 0) {

                // Incorporate changes
                let current = eventStore.current.changes.shift()
                while (current) {
                    if (current.action === "set") {
                        eventStore.current.events[current.eventId] = {
                            groupId: current.groupId,
                            from: current.from,
                            to: current.to
                        }
                        eventStore.current.dirtyGroups.add(current.groupId)
                    } else if (current.action === "delete") {
                        let groupId = eventStore.current.events[current.eventId].groupId
                        delete eventStore.current.events[current.eventId]
                        eventStore.current.dirtyGroups.add(groupId)
                    }
                    current = eventStore.current.changes.shift()
                }

                // Calculate group sets
                let dirtyGroups = Array.from(eventStore.current.dirtyGroups)
                let groupPoints: Record<string, Entry[]> = Object.fromEntries(dirtyGroups.map(groupId => [groupId, []]))
                for (let [eventId, event] of Object.entries(eventStore.current.events)) {
                    if (dirtyGroups.includes(event.groupId)) {
                        groupPoints[event.groupId].push({key: eventId, point: event.from, isEnd: false}, {
                            key: eventId,
                            point: event.to,
                            isEnd: true
                        })
                    }
                }

                // Calculate positions
                let groupSizes: Record<string, number> = {}
                let eventPositions: Record<string, number> = {}
                for (let [groupId, points] of Object.entries(groupPoints)) {
                    let [positions, size] = calculatePositions(points.sort(sortFunction))
                    groupSizes[groupId] = size
                    Object.assign(eventPositions, positions)
                }
                updateEventPositions(eventPositions)
                updateGroupSizes(groupSizes)
                eventStore.current.dirtyGroups.clear()
            }
            window.requestIdleCallback(callback, {timeout: 50})
        }

        callback()
    }, [eventStore, updateEventPositions, updateGroupSizes])

    return <></>
})

EventGroupStoreAgent.displayName = "EventGroupStoreAgent"

export const EventGroupStoreProvider = React.forwardRef<EventGroupStoreHandle, Record<string, unknown>>(({children}, forwardRef) => {
    let ref = useRef<EventStore>({events: {}, dirtyGroups: new Set<string>(), changes: []})

    return <EventStoreContext.Provider value={ref}>
        <Provider createStore={createStore}>
            <EventGroupStoreAgent ref={forwardRef}/>
            {children}
        </Provider>
    </EventStoreContext.Provider>
})

EventGroupStoreProvider.displayName = "EventGroupStoreProvider"

let useRegister = () => {
    let eventStore = useEventStore()
    return useCallback((eventId: string, groupId: string, from: number, to: number) => {
        if (eventStore?.current) {
            eventStore.current.changes.push({action: 'set', eventId, groupId, from, to})
        }
    }, [eventStore])
}

let useUnRegister = () => {
    let eventStore = useEventStore()
    return useCallback((eventId: string) => {
        if (eventStore?.current) {
            eventStore.current.changes.push({action: 'delete', eventId})
        }
    }, [eventStore])
}


export const useEventGroupPosition = (eventId: string, groupId: string, from: number, to: number) => {
    let registerEvent = useRegister()
    let unregisterEvent = useUnRegister()

    useEffect(() => {
        registerEvent(eventId, groupId, from, to)
    }, [eventId, groupId, from, to, registerEvent, unregisterEvent])

    useEffect(() => {
        return () => {
            unregisterEvent(eventId)
        }
    }, [eventId, unregisterEvent])

    let selector = useCallback((state: EventGroupStoreShape) => {
        return state.eventPositions?.[eventId]
    }, [eventId])

    return useEventGroupStore(selector)
}