import {useSelector} from './index'
import {StoreShape, TimelineEvent} from './shape'
import {shallowEqual} from 'react-redux'
import {createSelector} from 'reselect'
import {areIntervalsIntersecting} from 'schedule-fns/lib/src/functions/intervals'
import {PureInterval} from './reducers/events'

export const useAnimate = () => useSelector(state => state.animate)

export const useEvents = () => useSelector(state => state.events)

export const useGetInterval = (id: string) => useSelector(
    state => {
        return state.events?.[id].volatileState?.interval || state.events?.[id].interval
    },
    shallowEqual,
)


const eventSelector = (state: StoreShape) => state.events

// Returns [groupId1, groupId2, ...]
const getGroupIdsFromEvents = createSelector(
    eventSelector,
    events => Array.from(new Set(Object.values(events).map(event => event.group))),
)

// Returns {eventId1: groupId1, eventId2: groupId2, ...}
const getEventIdToGroupIdMap = createSelector(
    eventSelector,
    (events) => {
        return Object.fromEntries(Object.entries(events).map(([id, event]) => [id, event.group])) as Record<string, string>
    },
)

// Returns {groupId1: [eventId1, eventId2], groupId2: [eventId3], ...}
const getGroupsAndEventIds = createSelector(
    getGroupIdsFromEvents,
    getEventIdToGroupIdMap,
    (groups, eventIdToGroupMap) => {
        return Object.fromEntries(
            groups.map(
                (groupId) => [
                    groupId,
                    Object.entries(eventIdToGroupMap)
                    .filter(([_, eventGroupId]) => eventGroupId === groupId)
                    .map(([eventId, _]) => eventId),
                ],
            ),
        ) as Record<string, string[]>
    },
)

// Returns {eventId1: interval1, eventId2: interval2, ...}
export const getEventIntervals = createSelector(
    eventSelector,
    (events) => {
        return Object.fromEntries(Object.entries(events).map(([id, event]) => [id, event.volatileState?.interval || event.interval])) as Record<string, PureInterval>
    },
)

// Returns {groupId1: {eventId1: interval1, eventId2: interval2}, groupId2: {eventId3: interval3}, ...}
const getGroupsAndEventIntervals = createSelector(
    getGroupsAndEventIds,
    getEventIntervals,
    (groupsAndEventIds, eventIntervals) => {
        return Object.fromEntries(
            Object.entries(groupsAndEventIds).map(
                ([groupId, eventIds]) => [
                    groupId,
                    Object.fromEntries(
                        eventIds.map((eventId) => [eventId, eventIntervals[eventId]]),
                    ),
                ],
            ),
        ) as Record<string, Record<string, PureInterval>>
    },
)

// Returns {groupId1: {eventId1: position1, eventId2: position2}, groupId2: {eventId3: position3}, ...}
const getGroupsAndEventPositions = createSelector(
    getGroupsAndEventIntervals,
    (groupsAndEventIntervals) => {
        return Object.fromEntries(Object.entries(groupsAndEventIntervals).map(([groupId, eventIntervals]) => [groupId, distributeEventsVertically(eventIntervals)])) as Record<string, Record<string, number>>
    },
)

// Returns {groupId1: height1, groupId2: height2, ...}
export const getGroupHeights = createSelector(
    getGroupsAndEventPositions,
    (groupsAndEventPositions) => {
        return Object.fromEntries(Object.entries(groupsAndEventPositions).map(([groupId, eventPositions]) => [groupId, Math.max(...Object.entries(eventPositions).map(([_, position]) => position)) + 1]))
    },
)

// Returns {groupId1: position1, groupId2: position2, ...}
export const getGroupPositions = createSelector(
    getGroupHeights,
    (groupHeights) => {
        return Object.entries(groupHeights).reduce<[Record<string, number>, number]>(
            (aggregate, [groupId, height]) => {
                let [groups, offset] = aggregate
                return [{
                    ...groups,
                    [groupId]: offset,
                }, offset + height]
            }, [{}, 0])[0]
    },
)

export const useGroupPositions = () => useSelector(getGroupPositions, shallowEqual)

export const useGetGroupHeights = () => useSelector(getGroupHeights, shallowEqual)

export const useGetGroupsFromEvents = () => useSelector(getGroupIdsFromEvents, shallowEqual)

export const getEventsInGroup = (groupId: string) => createSelector(
    eventSelector,
    (events) => {
        return Object.fromEntries(Object.entries(events).filter(([_, event]) => event.group === groupId).map(([key, event]) => [key, event])) as Record<string, TimelineEvent>
    },
)

export const getGroupsAndEvents = createSelector(
    getGroupIdsFromEvents,
    eventSelector,
    (groups, events) => {
        return Object.fromEntries(groups.map(groupId => [groupId, Object.fromEntries(Object.entries(events).filter(([_, event]) => event.group === groupId).map(([key, event]) => [key, event])) as Record<string, TimelineEvent>]))
    },
)


export const useGetGroupsAndEvents = () => useSelector(getGroupsAndEvents, shallowEqual)


export const getEventIntervalsInGroup = (groupId: string) => createSelector(
    eventSelector,
    (events) => {
        return Object.fromEntries(Object.entries(events).filter(([_, event]) => event.group === groupId).map(([key, event]) => [key, event.volatileState?.interval || event.interval])) as Record<string, PureInterval>
    },
)

export const useGetEventsInGroup = (groupId: string) => {
    return useSelector(getEventsInGroup(groupId), shallowEqual)
}

function distributeEventsVertically(events: Record<string, PureInterval>): Record<string, number> {
    let positionedEvents: Record<string, {interval: PureInterval, position: number}> = {}
    for (const [key, interval] of Object.entries(events)) {
        let positions = Object.values(positionedEvents).filter(
            (leftEvent) => areIntervalsIntersecting(leftEvent.interval, interval) && leftEvent.interval.end !== interval.start && leftEvent.interval.start !== interval.end,
        ).map((leftEvent) => leftEvent.position)
        let position = 0
        while (positions.includes(position)) {
            position++
        }
        positionedEvents = {...positionedEvents, [key]: {interval, position}}
    }
    return Object.fromEntries(Object.entries(positionedEvents).map(([key, data]) => [key, data.position]))
}

export const getPositionsInGroup = (groupId: string) => createSelector(
    [getEventIntervalsInGroup(groupId)],
    (events) => distributeEventsVertically(events),
)

export const useGetPositionsInGroup = (groupId: string) => useSelector(getPositionsInGroup(groupId), shallowEqual)

export const useGetVerticalPositions = () => useSelector(state => {
    return state
})

export const useInitialized = () => useSelector(state => state.initialized)

export const useSize = () => useSelector(state => state.size)

export const useSpringConfig = () => useSelector(state => state.springConfig)

export const useStartDate = () => useSelector(state => state.timeScale.startDate)

export const useDateZero = () => useSelector(state => state.timeScale.dateZero)

export const useTimePerPixel = () => useSelector(state => state.timeScale.timePerPixel)

export const useEndDate = () => useSelector(
    state => {
        return state.timeScale.startDate.valueOf() + state.size.width * state.timeScale.timePerPixel
    },
)

export const useZoomCenter = () => useSelector(state => state.timeScale.zoomCenter)

export const useTimeZone = () => useSelector(state => state.timeZone)

export const useWeekStartsOn = () => useSelector(state => state.weekStartsOn)