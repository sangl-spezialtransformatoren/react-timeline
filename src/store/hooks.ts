import {useSelector} from './index'
import {shallowEqual} from 'react-redux'
import {IntervalCreator} from '../functions'
import {
    getGroupOffsets,
    getHeaderIntervals,
    selectAnimate,
    selectDateZero,
    selectEvent,
    selectEventIdsOrderedForPainting,
    selectEventIdToGroupIdMap,
    selectEventPositionsInGroup,
    selectEventProps,
    selectGroupHeight,
    selectGroupHeights,
    selectGroupIds,
    selectGroupIndex,
    selectGroupIndices,
    selectGroupOffset,
    selectHeaderHeight,
    selectInitialized,
    selectInterval,
    selectMapEventIdToProps,
    selectNumberOfGroups,
    selectSelected,
    selectSize,
    selectSpringConfig,
    selectStartDate,
    selectTimePerPixel,
    selectTimeZone,
} from './selectors'


export const useEvent = (eventId: string) => useSelector(selectEvent(eventId), shallowEqual)
export const useAnimate = () => useSelector(selectAnimate)
export const useGetInterval = (id: string) => useSelector(selectInterval(id), shallowEqual)
export const useGroupOffsets = () => useSelector(getGroupOffsets, shallowEqual)
export const useGroupOffset = (groupId: string) => useSelector(selectGroupOffset(groupId))
export const useEventIdsOrderedForPainting = () => useSelector(selectEventIdsOrderedForPainting, shallowEqual)
export const useEventAndGroupIds = () => useSelector(selectEventIdToGroupIdMap, shallowEqual)
export const useGroupHeights = () => useSelector(selectGroupHeights, shallowEqual)
export const useGroupHeight = (groupId: string) => useSelector(selectGroupHeight(groupId))
export const useGroupIndices = () => useSelector(selectGroupIndices, shallowEqual)
export const useGroupIndex = (groupId: string) => useSelector(selectGroupIndex(groupId))
export const useGetHeaderIntervals = (intervalCreator: IntervalCreator, intervalLength: number) => useSelector(getHeaderIntervals(intervalCreator, intervalLength), shallowEqual)
export const useEventPositionsInGroup = () => useSelector(selectEventPositionsInGroup, shallowEqual)
export const useInitialized = () => useSelector(selectInitialized)
export const useSize = () => useSelector(selectSize)
export const useSpringConfig = () => useSelector(selectSpringConfig)
export const useStartDate = () => useSelector(selectStartDate)
export const useDateZero = () => useSelector(selectDateZero)
export const useTimePerPixel = () => useSelector(selectTimePerPixel)
export const useTimeZone = () => useSelector(selectTimeZone)
export const useMapEventIdToProps = () => useSelector(selectMapEventIdToProps, shallowEqual)
export const useEventProps = (eventId: string) => useSelector(selectEventProps(eventId), shallowEqual)
export const useIsEventSelected = (eventId: string) => useSelector(selectSelected(eventId), shallowEqual)
export const useGroupIds = () => useSelector(selectGroupIds, shallowEqual)
export const useHeaderHeight = () => useSelector(selectHeaderHeight)
export const useNumberOfGroups = () => useSelector(selectNumberOfGroups)