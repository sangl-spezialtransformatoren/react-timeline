import {RequiredEventData, RequiredGroupData, StoreShape} from './shape'
import {areIntervalsIntersecting} from 'schedule-fns/lib/src/functions/intervals'
import {PureInterval} from './reducers/events'
import {BusinessLogic} from './businessLogic'
import {getDefaultTimeZone} from '../index'
import {IntervalCreator} from '../functions/intervals'
import {compareAsc} from 'date-fns'
import {createSelector} from './index'

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

export const selectScrollOffset = select(() => state => state.presentational.scrollOffset)
export const selectContentHeight = select(() => state => state.presentational.contentHeight)
export const selectDrawerOpened = select(() => state => state.presentational.drawerOpened)
export const selectDrawerWidth = select(() => state => state.presentational.drawerWidth)
export const selectEventHeight = select(() => state => state.presentational.eventHeight)
export const selectEventMargin = select(() => state => state.presentational.eventSpacing)
export const selectGroupPadding = select(() => state => state.presentational.groupPadding)
export const selectMinGroupHeight = select(() => state => state.presentational.minGroupHeight)

// Returns {eventId1: event, eventId2: event, ...}
export const selectSelectedEvents = (config: BusinessLogic) => createSelector(
    [selectEvents(config), selectInternalEventData(config)],
    (events, internalEventData) => {
        return Object.fromEntries(Object.entries(events).filter(([eventId, _]) => !!internalEventData?.[eventId]?.selected || false))
    },
)

// Returns number
export const selectNumberOfSelectedEvents = (config: BusinessLogic) => createSelector(
    [selectSelectedEvents(config)],
    (events) => Object.keys(events).length,
)

// Returns [groupId1, groupId2, ...]
export const selectOrderedGroupIds = (config: BusinessLogic) => createSelector(
    [selectGroups(config)],
    function selectGroupIdsCombiner(groups) {
        let orderedGroups = config.orderGroups(groups)
        return orderedGroups as string[]
    },
)


// Returns {groupId1: [eventId1, eventId2], groupId2: [eventId3], ...}
export const selectMapGroupIdsToEventIds = (config: BusinessLogic) => createSelector(
    [selectOrderedGroupIds(config), selectEventIdToGroupIdMap(config)],
    function selectMapGroupIdsToEventIdsCombiner(groups, eventIdToGroupMap) {
        return Object.fromEntries(groups.map(groupId => [groupId, Object.entries(eventIdToGroupMap).filter(([_, eventGroupId]) => eventGroupId === groupId).map(([eventId, _]) => eventId)])) as Record<string, string[]>
    },
)


//Returns {eventId1: event1, eventId2, event2, ...}
export const selectEventsWithVolatileState = (config: BusinessLogic) => createSelector(
    [selectEvents(config), selectInternalEventData(config)],
    function selectEventsWithVolatileStateCombiner(events, internalEventData) {
        return Object.fromEntries(Object.entries(events).map(
            ([eventId, event]) => {
                return [eventId, {
                    ...events[eventId],
                    interval: internalEventData?.[eventId]?.interval || event.interval,
                    groupId: internalEventData?.[eventId]?.groupId || event.groupId,
                    selected: internalEventData?.[eventId]?.selected || false,
                }]
            }),
        ) as Record<string, RequiredEventData & {selected: boolean}>
    },
)


// Returns event
export const selectEvent = (eventId: string) => (config: BusinessLogic) => createSelector(
    [selectEvents(config)],
    function selectEventCombiner(events) {
        return events[eventId]
    },
)

// Returns {eventId1: interval1, eventId2: interval2, ...}
export const selectMapEventIdToVolatileInterval = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    function (events) {
        return Object.fromEntries(Object.entries(events).map(([eventId, event]) => [eventId, event.interval]))
    },
)

// Returns {eventId1: layerNumber1, eventId2: layerNumber2, ...}
export const selectMapEventToLayerNumber = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    function selectMapEventToLayerNumberCombiner(events) {
        return config.mapEventsToLayer(events)
    },
)

export const selectDisplayEventsInSameRow = (config: BusinessLogic) => createSelector(
    [selectEvents(config)],
    function selectDisplayEventsInSameRowCombiner(events) {
        return config.displayEventsInSameRow(events)
    },
)

export const selectMapEventsToGroup = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    function selectMapEventsToGroupCombiner(events) {
        return Object.fromEntries(Object.entries(events).map(([eventId, event]) => [eventId, event.groupId])) as Record<string, string>
    },
)

export const selectMapEventsToLayers = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    function selectMapEventsToGroup(events) {
        return config.mapEventsToLayer(events) as Record<string, number>
    },
)

export const selectMapEventsToGroupsAndLayers = (config: BusinessLogic) => createSelector(
    [selectMapEventsToGroup(config), selectMapEventsToLayers(config)],
    function selectMapEventsToGroupsAndLayersCombiner(mapEventsToGroups, mapEventsToLayers) {
        return Object.fromEntries(Object.keys(mapEventsToGroups).map(eventId => [eventId, [mapEventsToGroups[eventId], mapEventsToLayers[eventId]]])) as Record<string, [string, number]>

    },
)


export const selectGroupAndLayerPairs = (config: BusinessLogic) => createSelector(
    [selectMapEventsToGroupsAndLayers(config)],
    function selectGroupAndLayerPairsCombiner(pairs) {
        let x: [string, number][] = []
        for (let [groupId, layer] of Object.values(pairs)) {
            if (!x.some(([groupId_, layer_]) => groupId_ === groupId && layer_ === layer)) {
                x = [...x, [groupId, layer]]
            }
        }
        return x
    },
)

export const selectPositioningBatches = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config), selectGroupAndLayerPairs(config), selectMapEventsToGroupsAndLayers(config)],
    function selectPositioningBatchesCombiner(events, pairs, mapEventsToGroupsAndLayers) {
        let batches = pairs.map(([groupId, layerId]) => Object.keys(mapEventsToGroupsAndLayers).filter(eventId => {
            return mapEventsToGroupsAndLayers[eventId][0] === groupId && mapEventsToGroupsAndLayers[eventId][1] === layerId
        }))
        return batches.map(batch => config.orderEventsForPositioning(Object.fromEntries(batch.map(eventId => [eventId, events[eventId]]))))
    },
)

export const selectEventIntervals = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    events => Object.fromEntries(Object.entries(events).map(([eventId, event]) => [eventId, event.interval])) as Record<string, PureInterval>,
)

// Returns {eventId1: position1, eventId2: position2, eventId3: position3, ...}
export const selectEventPositionsInGroup = (config: BusinessLogic) => createSelector(
    [selectPositioningBatches(config), selectEventIntervals(config), selectDisplayEventsInSameRow(config)],
    function selectEventPositionsInGroupCombiner(orderedBatches, intervals, displayEventsInSameRow) {
        let positions = orderedBatches.map(batch => {

            return distributeEventsVertically(batch, Object.fromEntries(batch.map(eventId => [eventId, intervals[eventId]])), displayEventsInSameRow)
        }).reduce((aggregate, element) => ({...aggregate, ...element}), {})
        return positions as Record<string, number>
    },
)

// Returns {groupId1: height1, groupId2: height2, ...}
export const selectGroupEventHeights = (config: BusinessLogic) => createSelector(
    [selectMapGroupIdsToEventIds(config), selectEventPositionsInGroup(config)],
    function selectGroupEventHeightsCombiner(mapGroupToEvents, eventPositions) {
        return Object.fromEntries(Object.entries(mapGroupToEvents).map(([groupId, events]) => {
            let height = Math.max(...events.map(eventId => eventPositions[eventId])) + 1
            height = height === -Infinity ? 0 : height
            return [groupId, height]
        }))
    },
)

// Returns {groupId1: offset1, groupId2: offset2, ...}
export const getGroupOffsets = (config: BusinessLogic) => createSelector(
    [selectOrderedGroupIds(config), selectGroupEventHeights(config)],
    function getGroupOffsetsCombiner(groupIds, groupHeights) {
        return groupIds.reduce<[Record<string, number>, number]>(
            (aggregate, groupId) => {
                let [groups, offset] = aggregate
                return [{
                    ...groups,
                    [groupId]: offset,
                }, offset + groupHeights[groupId]]
            }, [{}, 0])[0]
    },
)

// Returns {groupId1: position1, groupId2: position2, ...}
export const selectGroupIndices = (config: BusinessLogic) => createSelector(
    [selectOrderedGroupIds(config)],
    function selectGroupIndicesCombiner(groupIds) {
        return Object.fromEntries(groupIds.map((groupId, index) => [groupId, index])) as Record<string, number>
    },
)


// Returns {groupId1: position1, groupId2: position2, ...}
export const selectGroupPositions = (config: BusinessLogic) => createSelector(
    [selectOrderedGroupIds(config), selectInternalGroupData(config)],
    function selectGroupPositionsCombiner(groupIds, internalGroupData) {
        return Object.fromEntries(groupIds.map((groupId) => [groupId, internalGroupData[groupId].position])) as Record<string, {x: number, y: number, width: number, height: number}>
    },
)

// Returns {groupId1: height1, groupId2: height2, ...}
export const selectGroupHeights = (config: BusinessLogic) => createSelector(
    [selectOrderedGroupIds(config), selectMinGroupHeight(config), selectEventHeight(config), selectGroupEventHeights(config), selectEventMargin(config), selectGroupPadding(config)],
    (groups, minHeight, eventHeight, groupHeights, eventDistance, groupPadding) => {
        return Object.fromEntries(groups.map(groupId => [groupId, Math.max(minHeight, eventHeight * groupHeights[groupId] + eventDistance * Math.max(groupHeights[groupId] - 1, 0) + groupPadding)])) as Record<string, number>
    },
)


// Returns {group1: y1, group2: y2, ...}
export const selectGroupYs = (config: BusinessLogic) => createSelector(
    [selectOrderedGroupIds(config), selectGroupHeights(config)],
    (groups, groupHeights) => {
        return groups.reduce<[number, Record<string, number>]>((agg, groupId) => {
            return [agg[0] + groupHeights[groupId], {...agg[1], [groupId]: agg[0]}]
        }, [0, {}])[1] as Record<string, number>
    },
)

// Returns [interval1, interval2, ...]
export const getHeaderIntervals = (intervalCreator: IntervalCreator, intervalLength: number) => (config: BusinessLogic) => createSelector(
    [selectStartDate(config), selectEndDate(config), selectTimeZone(config), selectWeekStartsOn(config)],
    function getHeaderIntervalsCombiner(startDate, endDate, timeZone, weekStartsOn) {
        let temporalWidth = (endDate.valueOf() - startDate.valueOf())

        let width = 0.2
        let from = startDate.valueOf() - width * temporalWidth
        let to = endDate.valueOf() + width * temporalWidth

        let factor = 1
        let roundedFrom = Math.floor(from / (factor * intervalLength)) * factor * intervalLength
        let roundedTo = Math.ceil(to / (factor * intervalLength)) * factor * intervalLength

        return intervalCreator(roundedFrom, roundedTo, {
            timeZone: timeZone || getDefaultTimeZone(),
            weekStartsOn: weekStartsOn || 1,
        })
    },
)


// Returns [eventId1, eventId2, ...]
export const selectEventIdsOrderedForPainting = (config: BusinessLogic) => createSelector(
    [selectMapEventIdToVolatileInterval(config), selectMapEventToLayerNumber(config), selectMapEventIdToSelected(config)],
    function selectEventIdsOrderedForPaintingCombiner(mapEventToInterval, mapEventToLayer, mapEventToSelected) {
        let indices: Record<string, [PureInterval, number, boolean]> = Object.fromEntries(Object.keys(mapEventToLayer).map(eventId => [eventId, [mapEventToInterval[eventId], mapEventToLayer[eventId], mapEventToSelected[eventId]]]))
        return Object.entries(indices).sort(([_, [intervalA, layerA, selectedA]], [__, [intervalB, layerB, selectedB]]) => (layerA === layerB) ? (selectedA === selectedB ? compareAsc(intervalA.start, intervalB.start) : (+selectedA) - (+selectedB)) : layerA - layerB).map(([eventId]) => eventId)
    },
)

// Returns {eventId1: groupId1, eventId2: groupId2, ...}
export const selectEventIdToGroupIdMap = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    function selectEventIdToGroupIdMapCombiner(events) {
        return Object.fromEntries(Object.entries(events).map(([eventId, {groupId}]) => [eventId, groupId])) as Record<string, string>
    },
)

export const selectMapEventIdToProps = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    (events) => config.mapEventsToProps(events),
)

export const selectMapGroupIdToProps = (config: BusinessLogic) => createSelector(
    [selectGroups(config)],
    (groups) => config.mapGroupsToProps(groups),
)

// Returns {eventId1: true, eventId2: false, ...}
export const selectMapEventIdToSelected = (config: BusinessLogic) => createSelector(
    [selectEventsWithVolatileState(config)],
    function selectMapEventIdToSelectedCombiner(events) {
        return Object.fromEntries(Object.entries(events).map(([eventId, event]) => [eventId, !!event?.selected])) as Record<string, boolean>
    },
)

export const selectSelected = (eventId: string) => (config: BusinessLogic) => createSelector(
    [selectMapEventIdToSelected(config)],
    (events) => events[eventId],
)

export const selectNumberOfGroups = (config: BusinessLogic) => createSelector(
    [selectGroupIndices(config)],
    (groupIndices) => Math.max(...Object.values(groupIndices)) + 1,
)

export const selectEventYs = (config: BusinessLogic) => createSelector(
    [selectEventIdsOrderedForPainting(config), selectGroupPadding(config), selectEventHeight(config), selectEventMargin(config), selectEventPositionsInGroup(config), selectGroupYs(config), selectMapEventsToGroup(config)],
    function selectEventYsCombiner(events, groupPadding, eventHeight, eventDistance, eventPositions, groupYs, eventToGroup) {
        return Object.fromEntries(events.map(eventId => [eventId, groupPadding / 2 + (eventHeight + eventDistance) * eventPositions[eventId] + groupYs[eventToGroup[eventId]]]))
    },
)