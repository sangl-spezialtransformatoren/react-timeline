import {compareAsc} from 'date-fns'
import {RequiredEventData, RequiredGroupData} from './shape'
import {makePureInterval} from './reducers/events'

export type ValidateDuringDragInput<E extends RequiredEventData = RequiredEventData, G extends RequiredGroupData = RequiredGroupData> = {
    manipulatedEventId: string,
    newIntervals: Record<string, Interval>,
    newGroupAssignments: Record<string, string>,
    currentEvents: Record<string, E>,
    currentGroups: Record<string, G>
}

export type ValidateDuringDragOutput<E extends RequiredEventData = RequiredEventData, G extends RequiredGroupData = RequiredGroupData> = {
    updatedEvents?: Record<string, E>,
    deletedEvents?: string[],
    updatedGroups?: Record<string, G>,
    deletedGroups?: string[]
}

export type ValidateAfterDragInput<E extends RequiredEventData = RequiredEventData, G extends RequiredGroupData = RequiredGroupData> = {
    manipulatedEventId: string,
    newIntervals: Record<string, Interval>,
    newGroupAssignments: Record<string, string>,
    currentEvents: Record<string, E>,
    currentGroups: Record<string, G>
}

export type ValidateAfterDragOutput<E extends RequiredEventData = RequiredEventData, G extends RequiredGroupData = RequiredGroupData> = {
    updatedEvents?: Record<string, E>,
    deletedEvents?: string[],
    updatedGroups?: Record<string, G>,
    deletedGroups?: string[]
}

export type ValidateDuringResizeInput<E extends RequiredEventData = RequiredEventData, G extends RequiredGroupData = RequiredGroupData> = {
    manipulatedEventId: string,
    newIntervals: Record<string, Interval>,
    currentEvents: Record<string, E>,
    currentGroups: Record<string, G>
}

export type ValidateDuringResizeOutput<E extends RequiredEventData = RequiredEventData, G extends RequiredGroupData = RequiredGroupData> = {
    updatedEvents?: Record<string, E>,
    deletedEvents?: string[],
    updatedGroups?: Record<string, G>,
    deletedGroups?: string[]
}

export type ValidateAfterResizeInput<E extends RequiredEventData = RequiredEventData, G extends RequiredGroupData = RequiredGroupData> = {
    manipulatedEventId: string,
    newIntervals: Record<string, Interval>,
    currentEvents: Record<string, E>,
    currentGroups: Record<string, G>
}

export type ValidateAfterResizeOutput<E extends RequiredEventData = RequiredEventData, G extends RequiredGroupData = RequiredGroupData> = {
    updatedEvents?: Record<string, E>,
    deletedEvents?: string[],
    updatedGroups?: Record<string, G>,
    deletedGroups?: string[]
}

export type BusinessLogic<E extends RequiredEventData = RequiredEventData, G extends RequiredGroupData = RequiredGroupData, EventProps extends {} = E, GroupProps extends {} = G> = {
    validateDuringDrag: (data: ValidateDuringDragInput<E, G>) => ValidateDuringDragOutput<E, G>
    validateAfterDrag: (data: ValidateAfterDragInput) => Promise<ValidateAfterDragOutput>
    validateDuringResize: (data: ValidateDuringResizeInput<E, G>) => ValidateDuringResizeOutput<E, G>
    validateAfterResize: (data: ValidateAfterResizeInput<E, G>) => Promise<ValidateAfterResizeOutput<E, G>>
    orderGroups: (currentGroups: Record<string, G>) => string[],
    orderEventsForPositioning: (data: Record<string, E>) => string[],
    mapEventsToLayer: (data: Record<string, E>) => Record<string, number>,
    mapEventsToProps: (data: Record<string, E>) => Record<string, EventProps>
    mapGroupsToProps: (data: Record<string, G>) => Record<string, GroupProps>
    displayEventsInSameRow: (data: Record<string, E>) => string[][]
    mergeNewEvents: (currentEvents: Record<string, E>, newEvents: Record<string, E>) => Record<string, E>
    mergeNewGroups: (currentGroups: Record<string, G>, newGroups: Record<string, G>) => Record<string, G>
}

export const DefaultBusinessLogic: BusinessLogic = {
    validateDuringDrag: ({newIntervals, newGroupAssignments, currentEvents}) => {
        let changedEvents = new Set([...Object.keys(newIntervals), ...Object.keys(newGroupAssignments)])
        let newEvents = Object.fromEntries(Array.from(changedEvents).map(
            eventId => {
                return [eventId, {
                    ...currentEvents[eventId],
                    interval: newIntervals?.[eventId] ? makePureInterval(newIntervals[eventId]) : currentEvents[eventId].interval,
                    groupId: newGroupAssignments?.[eventId] ? newGroupAssignments[eventId] : currentEvents[eventId].groupId,
                }]
            }))

        return {
            updatedEvents: newEvents,
        }
    },
    validateDuringResize: ({newIntervals, currentEvents}) => {
        let newEvents = Object.fromEntries(Object.keys(newIntervals).map(
            eventId => [eventId, {
                ...currentEvents[eventId],
                interval: newIntervals?.[eventId] ? makePureInterval(newIntervals[eventId]) : currentEvents[eventId].interval,
            }]))

        return {
            updatedEvents: newEvents,
        }
    },
    validateAfterDrag: async ({newIntervals, newGroupAssignments, currentEvents}) => {
        let changedEvents = new Set([...Object.keys(newIntervals), ...Object.keys(newGroupAssignments)])
        let newEvents = Object.fromEntries(Array.from(changedEvents).map(
            eventId => [eventId, {
                ...currentEvents[eventId],
                interval: newIntervals?.[eventId] ? makePureInterval(newIntervals[eventId]) : currentEvents[eventId].interval,
                groupId: newGroupAssignments?.[eventId] ? newGroupAssignments[eventId] : currentEvents[eventId].groupId,
            }]))

        return {
            updatedEvents: newEvents,
        }
    },
    validateAfterResize: async ({newIntervals, currentEvents}) => {
        let newEvents = Object.fromEntries(Object.keys(newIntervals).map(
            eventId => [eventId, {
                ...currentEvents[eventId],
                interval: newIntervals?.[eventId] ? makePureInterval(newIntervals[eventId]) : currentEvents[eventId].interval,
            }]))

        return {
            updatedEvents: newEvents,
        }
    },
    orderGroups: currentGroups => Object.keys(currentGroups).sort(),
    orderEventsForPositioning: data => {
        return Object.entries(data).sort(([_a, EventA], [_b, EventB]) => compareAsc(EventA.interval.start, EventB.interval.start)).map(([eventId]) => eventId)
    },
    mapEventsToLayer: data => {
        return Object.fromEntries(Object.keys(data).map((key, _) => [key, 0])) as Record<string, number>
    },
    mapEventsToProps: data => data,
    mapGroupsToProps: data => data,
    displayEventsInSameRow: _ => [],
    mergeNewEvents: (_, newEvents) => newEvents,
    mergeNewGroups: (_, newGroups) => newGroups,
}
