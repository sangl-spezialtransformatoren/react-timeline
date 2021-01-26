import {RequiredEventData, RequiredGroupData, StoreShape} from './shape'
import {createSelector} from 'reselect'
import {areIntervalsIntersecting} from 'schedule-fns/lib/src/functions/intervals'
import {PureInterval} from './reducers/events'
import {BusinessLogic} from './businessLogic'
import {getDefaultTimeZone} from '../index'
import {IntervalCreator} from '../functions'
import {compareAsc} from 'date-fns'
import {shallowEqual} from 'react-redux'

export type ValueOf<T> = T[keyof T]

export function select<E extends RequiredEventData, G extends RequiredGroupData, T>(selector: (config: BusinessLogic<E, G>) => (state: StoreShape<E, G>) => T) {
    return selector
}

function positionEvent(positionedEvents: Record<string, {interval: PureInterval, position: number}>, interval: PureInterval) {
    let positions = Object.values(positionedEvents).filter(
        (leftEvent) => areIntervalsIntersecting(leftEvent.interval, interval) && leftEvent.interval.end !== interval.start && leftEvent.interval.start !== interval.end,
    ).map((leftEvent) => leftEvent.position)
    let position = 0
    while (positions.includes(position)) {
        position++
    }
    return position
}

// Positions the given events one after another so they don't overlap
function distributeEventsVertically(orderedEventIds: string[], mapEventToInterval: Record<string, PureInterval>, placeInSameRow: string[][] = []): Record<string, number> {
    let positionedEvents: Record<string, {interval: PureInterval, position: number}> = {}
    for (const eventId of orderedEventIds) {
        if (Object.keys(positionedEvents).includes(eventId)) {
            continue
        }
        let group = placeInSameRow.filter(group => group.includes(eventId))?.[0]
        let position: number
        if (!group) {
            group = [eventId]
        }
        position = Math.max(...group.map(eventId => positionEvent(positionedEvents, mapEventToInterval[eventId])))
        positionedEvents = {
            ...positionedEvents, ...(Object.fromEntries(group.map(eventId => [eventId, {
                interval: mapEventToInterval[eventId],
                position: position,
            }]))),
        }
    }
    return Object.fromEntries(Object.entries(positionedEvents).map(([key, data]) => [key, data.position]))
}


// Returns startDate
export const selectStartDate = select(() => (state) => state.timeScale.startDate)

// Returns endDate
export const selectEndDate = select(() => (state) => state.timeScale.startDate.valueOf() + state.size.width * state.timeScale.timePerPixel)

// Returns timeZone
export const selectTimeZone = select(() => (state) => state.timeZone)

// Returns weekStartsOn
export const selectWeekStartsOn = select(() => (state) => state.weekStartsOn)

// Returns animate
export const selectAnimate = select(() => (state) => state.animate)

// Returns initialized
export const selectInitialized = select(() => (state) => state.initialized)

// Returns {width, number, height: number}
export const selectSize = select(() => (state) => state.size)

// Returns springConfig
export const selectSpringConfig = select(() => (state) => state.springConfig)

// Returns dateZero
export const selectDateZero = select(() => (state) => state.timeScale.dateZero)

// Returns timePerPixel
export const selectTimePerPixel = select(() => (state) => state.timeScale.timePerPixel)

// Returns {eventId1: event, eventId2: event, ...}
export const selectEvents = select(() => (state) => state.events)

export const selectInternalEventData = select(() => (state) => state.internalEventData)

// Returns {groupId1: group1, groupId2: group2, ...}
export const selectGroups = select(() => (state) => state.groups)

export const selectInternalGroupData = select(() => (state) => state.internalGroupData)

// Returns number
export const selectHeaderHeight = select(() => state => state.presentational.headerHeight)

// Returns {eventId1: event, eventId2: event, ...}
export const selectSelectedEvents = (config: BusinessLogic) => createSelector(
    [selectEvents(config), selectInternalEventData(config)],
    (events, internalEventData) => Object.fromEntries(Object.entries(events).filter(([eventId, _]) => !!internalEventData?.[eventId]?.selected || false)),
)

// Returns number
export const selectNumberOfSelectedEvents = (config: BusinessLogic) => createSelector(
    [selectSelectedEvents(config)],
    (events) => Object.keys(events).length,
)

// Returns [groupId1, groupId2, ...]
export const selectGroupIds = (config: BusinessLogic) => createSelector(
    [selectEventIdToGroupIdMap(config), selectGroups(config)],
    (events, groups) => {
        let groupIdsFromEvents = Object.values(events)
        let groupIds = Object.keys(groups)
        let allGroupIds = new Set([...groupIdsFromEvents, ...groupIds])
        let orderedGroups = config.orderGroups({groupIds: Array.from(allGroupIds)}).groupIds
        return orderedGroups as string[]
    },
)


// Returns {groupId1: [eventId1, eventId2], groupId2: [eventId3], ...}
export const selectMapGroupIdsToEventIds = (config: BusinessLogic) => createSelector(
    [selectGroupIds(config), selectEventIdToGroupIdMap(config)],
    (groups, eventIdToGroupMap) => {
        let result = {}
        for (let groupId of groups) {
            result = {
                ...result,
                [groupId]: Object.entries(eventIdToGroupMap).filter(([_, eventGroupId]) => eventGroupId === groupId).map(([eventId, _]) => eventId),
            }
        }
        return result as Record<string, string[]>
    },
)

//Returns {eventId1: event1, eventId2, event2, ...}
export const selectEventsWithVolatileState = (config: BusinessLogic) => createSelector(
    [selectEvents(config), selectInternalEventData(config)],
    (events, internalEventData) => {
        let result = {}

        for (let [eventId, event] of Object.entries(events)) {
            result = {
                ...result,
                [eventId]: {
                    ...event,
                    interval: internalEventData?.[eventId]?.interval || event.interval,
                    groupId: internalEventData?.[eventId]?.groupId || event.groupId,
                    selected: internalEventData?.[eventId]?.selected || false,
                },

            }
        }
        return result as Record<string, ValueOf<StoreShape['events']> & {selected: boolean}>
    },
)


// Returns event
export const selectEvent = (eventId: string) => (config: BusinessLogic) => createSelector(
    [selectEvents(config)],
    (events) => {
        return events[eventId]
    },
)

// Returns {eventId1: interval1, eventId2: interval2, ...}
export const selectMapEventIdToVolatileInterval = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    (events) => {
        let result: Record<string, PureInterval> = {}
        for (let [id, event] of Object.entries(events)) {
            result = {
                ...result,
                [id]: event.interval,
            }
        }
        return result
    },
)

// Returns {eventId1: layerNumber1, eventId2: layerNumber2, ...}
export const selectMapEventToLayerNumber = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    (events) => {
        return config.mapEventsToLayer(events)
    },
)

// Returns (id: string) => Interval
export const selectInterval = (id: string) => (config: BusinessLogic) => createSelector(
    [selectMapEventIdToVolatileInterval(config)],
    (events) => {
        return events[id]
    },
)

// Returns [layer1, layer2, ...]
export const selectLayers = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    (events) => {
        return Array.from(new Set(Object.values(config.mapEventsToLayer(events))))
    },
)

// Returns {eventId1: position1, eventId2: position2, eventId3: position3, ...}
export const selectEventPositionsInGroup = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config), selectGroupIds(config), selectLayers(config), selectMapEventToLayerNumber(config), selectEventIdToGroupIdMap(config)],
    (events, groupIds, layers, mapEventToLayer, mapEventToGroup) => {
        let displayEventsInSameRow = config.displayEventsInSameRow(events)
        let pairs = groupIds.flatMap(groupId => layers.map(layerId => [groupId, layerId] as [string, number]))
        let mapEventsToGroupsAndLayers = Object.fromEntries(Object.keys(mapEventToLayer).map(eventId => [eventId, [mapEventToGroup[eventId], mapEventToLayer[eventId]]])) as Record<string, [string, number]>
        let batches = pairs.map(([groupId, layerId]) => Object.keys(events).filter(eventId => shallowEqual(mapEventsToGroupsAndLayers[eventId], [groupId, layerId])))
        let orderedBatches = batches.map(batch => config.orderEventsForPositioning(Object.fromEntries(batch.map(eventId => [eventId, events[eventId]]))))
        let positions = orderedBatches.map(batch => distributeEventsVertically(batch, Object.fromEntries(batch.map(eventId => [eventId, events[eventId].interval])), displayEventsInSameRow)).reduce((aggregate, element) => ({...aggregate, ...element}), {})
        return positions as Record<string, number>
    },
)

// Returns {groupId1: height1, groupId2: height2, ...}
export const selectGroupHeights = (config: BusinessLogic) => createSelector(
    [selectMapGroupIdsToEventIds(config), selectEventPositionsInGroup(config)],
    (mapGroupToEvents, eventPositions) => {
        let result: Record<string, number> = {}
        for (let [groupId, events] of Object.entries(mapGroupToEvents)) {
            let height = Math.max(...events.map(eventId => eventPositions[eventId])) + 1
            height = height === -Infinity ? 0 : height
            result = {
                ...result,
                [groupId]: height,
            }
        }
        return result
    },
)

// Returns {groupId1: offset1, groupId2: offset2, ...}
export const getGroupOffsets = (config: BusinessLogic) => createSelector(
    [selectGroupIds(config), selectGroupHeights(config)],
    (groupIds, groupHeights) => {
        let offset = 0
        let result: Record<string, number> = {}
        for (let groupId of groupIds) {
            result = {
                ...result,
                [groupId]: offset,
            }
            offset += groupHeights[groupId]
        }
        return result
    },
)

// Returns {groupId1: position1, groupId2: position2, ...}
export const selectGroupIndices = (config: BusinessLogic) => createSelector(
    [selectGroupIds(config)],
    (groupIds) => {
        let result: Record<string, number> = {}
        let orderedGroups = config.orderGroups({groupIds}).groupIds
        for (let [i, groupId] of orderedGroups.entries()) {
            result = {
                ...result,
                [groupId]: i,
            }
        }
        return result
    },
)

// Returns {groupId1: position1, groupId2: position2, ...}
export const selectGroupPositions = (config: BusinessLogic) => createSelector(
    [selectGroupIds(config), selectInternalGroupData(config)],
    (groupIds, internalGroupData) => {
        let result: Record<string, {x: number, y: number, width: number, height: number}> = {}
        for (let groupId of groupIds) {
            result = {
                ...result,
                [groupId]: internalGroupData?.[groupId].position || {x: 0, y: 0, width: 0, height: 0},
            }
        }
        return result
    },
)

// Returns [interval1, interval2, ...]
export const getHeaderIntervals = (intervalCreator: IntervalCreator, intervalLength: number) => (config: BusinessLogic) => createSelector(
    [selectStartDate(config), selectEndDate(config), selectTimeZone(config), selectWeekStartsOn(config)],
    (startDate, endDate, timeZone, weekStartsOn) => {
        let temporalWidth = (endDate.valueOf() - startDate.valueOf())

        let from = startDate.valueOf() - 0.5 * temporalWidth
        let to = endDate.valueOf() + 0.5 * temporalWidth

        let roundedFrom = Math.floor(from / (10 * intervalLength)) * 10 * intervalLength
        let roundedTo = Math.ceil(to / (10 * intervalLength)) * 10 * intervalLength

        return intervalCreator(roundedFrom, roundedTo, {
            timeZone: timeZone || getDefaultTimeZone(),
            weekStartsOn: weekStartsOn || 1,
        })
    },
)


// Returns [eventId1, eventId2, ...]
export const selectEventIdsOrderedByLayerAndStartDate = (config: BusinessLogic) => createSelector(
    [selectMapEventIdToVolatileInterval(config), selectMapEventToLayerNumber(config)],
    (mapEventToInterval, mapEventToLayer) => {
        let pairs: Record<string, [PureInterval, number]> = {}
        for (let eventId of Object.keys(mapEventToLayer)) {
            pairs = {
                ...pairs,
                [eventId]: [mapEventToInterval[eventId], mapEventToLayer[eventId]],
            }
        }
        return Object.entries(pairs).sort(([_, [intervalA, layerA]], [__, [intervalB, layerB]]) => (layerA === layerB) ? compareAsc(intervalA.start, intervalB.start) : layerA - layerB).map(([eventId]) => eventId)
    },
)

// Returns {eventId1: groupId1, eventId2: groupId2, ...}
export const selectEventIdToGroupIdMap = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    (events) => {
        let result: Record<string, string> = {}
        for (let [eventId, {groupId}] of Object.entries(events)) {
            result = {
                ...result,
                [eventId]: groupId,
            }
        }
        return result
    },
)

// Returns boolean
export const selectIsZooming = select(() => (state) => !!state.timeScale.zoomCenter)

export const selectMapEventIdToProps = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    (events) => config.mapEventsToProps(events),
)

export const selectEventProps = (eventId: string) => (config: BusinessLogic) => createSelector(
    [selectMapEventIdToProps(config)],
    (events) => events[eventId],
)

// Returns {eventId1: true, eventId2: false, ...}
export const selectMapEventIdToSelected = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    (events) => {
        return Object.fromEntries(Object.entries(events).map(([eventId, event]) => [eventId, !!event?.selected]))
    },
)

export const selectSelected = (eventId: string) => (config: BusinessLogic) => createSelector(
    [selectMapEventIdToSelected(config)],
    (events) => events[eventId],
)