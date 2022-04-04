import {useCallback, useEffect} from 'react'
import create from 'zustand'
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

export type EventGroupStoreShape = {
    eventPositionsByGroup: {
        [groupId: string]: Record<string, number>
    },
    groupHeights: Record<string, number>,
    setGroupPositions: (_: string, __: Record<string, number>) => unknown
}

export const useEventGroupStore = create<EventGroupStoreShape>(set => ({
    eventPositionsByGroup: {},
    groupHeights: {},
    setGroupPositions: (groupId, positions) => {
        set(state => {
            let eventPositionsByGroup = {
                ...state.eventPositionsByGroup,
                [groupId]: positions,
            }

            let groupHeights = Object.fromEntries(Object.entries(eventPositionsByGroup).map(([groupId, eventPositions]) => {
                return [groupId, Math.max(...Object.values(eventPositions), -1) + 1]
            }))

            return {
                ...state,
                eventPositionsByGroup,
                groupHeights
            }
        })
    },
}))

let groupSets: Record<string, {points: Entry[]}> = {}


export const useEventGroupPosition = (groupId: string, eventId: string, from: number, to: number) => {
    let setPositions = useEventGroupStore(state => state.setGroupPositions)

    useEffect(() => {
        let groupSet = groupSets?.[groupId]?.points
        if (!groupSet) {
            groupSet = []
            groupSets[groupId] = {...groupSets?.[groupId], points: groupSet}
        }
        groupSet = groupSet.filter(entry => entry.key !== eventId)
        groupSet.push({point: from, isEnd: false, key: eventId})
        groupSet.push({point: to, isEnd: true, key: eventId})
        groupSet = groupSet.sort(sortFunction)

        let positions: Record<string, number> = {}
        let occupation = 0n

        groupSet.forEach(({isEnd, key}: Entry) => {
            if (isEnd) {
                occupation = occupation & ~(2n ** BigInt(positions[key]))
            } else {
                let firstFreeSlot = bigint.log2(~occupation & -~occupation)
                positions[key] = Number(firstFreeSlot)
                occupation = occupation | (2n ** firstFreeSlot)
            }
        })
        groupSets[groupId] = {points: groupSet}
        setPositions(groupId, positions)

        return () => {
            groupSets[groupId] = {points: groupSets[groupId].points.filter(x => x.key !== eventId)}
        }
    }, [groupId, eventId, from, to, setPositions])

    let selector = useCallback((state: EventGroupStoreShape) => {
        return state.eventPositionsByGroup?.[groupId]?.[eventId]
    }, [eventId, groupId])

    return useEventGroupStore(selector)
}