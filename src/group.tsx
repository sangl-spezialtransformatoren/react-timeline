import React from 'react'
import {EventComponent} from './presentational'
import {
    useEventAndGroupIds,
    useEventIdsOrderedByLayerAndStartDate,
    useEventPositionsInGroup,
    useGroupOffsets,
    useGroupPositions
} from "./store/hooks"


export const EventGroups: React.FC = () => {
    let events = useEventIdsOrderedByLayerAndStartDate()
    let eventToGroup = useEventAndGroupIds()
    let eventPositions = useEventPositionsInGroup()
    let groupOffsets = useGroupOffsets()
    let groupPositions = useGroupPositions()

    return <>
        {events.map((eventId) => {
            let groupId = eventToGroup[eventId]
            let positionInGroup = eventPositions[eventId]
            let groupOffset = groupOffsets[groupId]
            let groupPosition = groupPositions[groupId]
            return <React.Fragment key={eventId}>
                <EventComponent id={eventId} y={4 + 24 * positionInGroup + 24 * groupOffset + 20 * groupPosition}/>
            </React.Fragment>
        })}
    </>
}
