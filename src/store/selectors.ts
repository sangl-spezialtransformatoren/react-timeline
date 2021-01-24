import {RequiredEventData, RequiredGroupData, StoreShape} from './shape'
import {createSelector} from 'reselect'
import {areIntervalsIntersecting} from 'schedule-fns/lib/src/functions/intervals'
import {PureInterval} from './reducers/events'
import {BusinessLogic} from './businessLogic'
import {getDefaultTimeZone} from '../index'
import {IntervalCreator} from '../functions'
import {compareAsc} from 'date-fns'
import {shallowEqual} from 'react-redux'


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

// Returns [groupId1, groupId2, ...]
export const selectGroupIds = (config: BusinessLogic) => createSelector(
    [selectEventIdToGroupIdMap(config)],
    events => {
        return Array.from(new Set(Object.values(events))) as string[]
    },
)


// Returns {groupId1: [eventId1, eventId2], groupId2: [eventId3], ...}
export const selectMapGroupIdsToEventIds = (config: BusinessLogic) => createSelector(
    [selectGroupIds(config), selectEventIdToGroupIdMap(config)],
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

//Returns {eventId1: event1, eventId2, event2, ...}
export const selectEventsWithVolatileState = (config: BusinessLogic) => createSelector(
    [selectEvents(config)],
    (events) => {
        return Object.fromEntries(Object.entries(events).map(
            ([eventId, event]) => {
                let {volatileState, ...evt} = event
                return [eventId, {...evt, interval: volatileState?.interval || evt.interval}]
            }),
        )
    },
)

// Returns {eventId1: interval1, eventId2: interval2, ...}
export const selectMapEventIdToVolatileInterval = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    (events) => {
        return Object.fromEntries(Object.entries(events).map(([id, event]) => [id, event.interval])) as Record<string, PureInterval>
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
    [selectEvents(config)],
    (events) => {
        return Array.from(new Set(Object.values(config.mapEventsToLayer(events))))
    },
)

// Returns {eventId1: position1, eventId2: position2, eventId3: position3, ...}
export const selectEventPositionsInGroup = (config: BusinessLogic) => createSelector(
    [selectGroupIds(config), selectLayers(config), selectMapEventToLayerNumber(config), selectEventIdToGroupIdMap(config), selectEventsWithVolatileState(config)],
    (groupIds, layers, mapEventToLayer, mapEventToGroup, events) => {
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
        return Object.fromEntries(Object.entries(mapGroupToEvents).map(([groupId, events]) => [groupId, Math.max(...events.map(eventId => eventPositions[eventId])) + 1]))
    },
)

// Returns {groupId1: offset1, groupId2: offset2, ...}
export const getGroupOffsets = (config: BusinessLogic) => createSelector(
    [selectGroupHeights(config)],
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

// Returns {groupId1: position1, groupId2: position2, ...}
export const selectGroupPositions = (config: BusinessLogic) => createSelector(
    [selectGroupIds(config)],
    (groupIds) => {
        return Object.fromEntries(config.orderGroups({groupIds}).groupIds.map((groupId, index) => [groupId, index])) as Record<string, number>
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
        let pairs = Object.fromEntries(Object.keys(mapEventToLayer).map(eventId => [eventId, [mapEventToInterval[eventId], mapEventToLayer[eventId]]])) as Record<string, [PureInterval, number]>
        return Object.entries(pairs).sort(([_, [intervalA, layerA]], [__, [intervalB, layerB]]) => (layerA === layerB) ? compareAsc(intervalA.start, intervalB.start) : layerA - layerB).map(([eventId]) => eventId)
    },
)

// Returns {eventId1: groupId1, eventId2: groupId2, ...}
export const selectEventIdToGroupIdMap = (config: BusinessLogic) => createSelector(
    [selectEvents(config)],
    (events) => {
        return Object.fromEntries(Object.entries(events).map(([eventId, {groupId}]) => [eventId, groupId])) as Record<string, string>
    },
)

// Returns boolean
export const selectIsZooming = select(() => (state) => !!state.timeScale.zoomCenter)

export const selectMapEventIdToProps = (config: BusinessLogic) => createSelector(
    [selectEvents(config)],
    (events) => config.mapEventsToProps(events),
)

export const selectEventProps = (eventId: string) => (config: BusinessLogic) => createSelector(
    [selectMapEventIdToProps(config)],
    (events) => events[eventId],
)

// Returns {eventId1: true, eventId2: false, ...}
export const selectMapEventIdToSelected = (config: BusinessLogic) => createSelector(
    [selectEvents(config)],
    (events) => Object.fromEntries(Object.entries(events).map(([eventId, event]) => [eventId, !!event?.selected]),
    ),
)

export const selectSelected = (eventId: string) => (config: BusinessLogic) => createSelector(
    [selectMapEventIdToSelected(config)],
    (events) => events[eventId],
)