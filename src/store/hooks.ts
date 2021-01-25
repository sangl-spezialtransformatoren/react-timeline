import {useSelector} from './index'
import {shallowEqual} from 'react-redux'
import {IntervalCreator} from '../functions'
import {
    getGroupOffsets,
    getHeaderIntervals,
    selectAnimate,
    selectDateZero,
    selectEventIdsOrderedByLayerAndStartDate,
    selectEventIdToGroupIdMap,
    selectEventPositionsInGroup,
    selectEventProps,
    selectGroupHeights,
    selectGroupIds,
    selectGroupPositions,
    selectInitialized,
    selectInterval,
    selectMapEventIdToProps,
    selectSelected,
    selectSize,
    selectSpringConfig,
    selectStartDate,
    selectTimePerPixel,
    selectTimeZone,
} from './selectors'


export const useAnimate = () => useSelector(selectAnimate)
export const useGetInterval = (id: string) => useSelector(selectInterval(id), shallowEqual)
export const useGroupOffsets = () => useSelector(getGroupOffsets, shallowEqual)
export const useEventIdsOrderedByLayerAndStartDate = () => useSelector(selectEventIdsOrderedByLayerAndStartDate, shallowEqual)
export const useEventAndGroupIds = () => useSelector(selectEventIdToGroupIdMap, shallowEqual)
export const useGroupHeights = () => useSelector(selectGroupHeights, shallowEqual)
export const useGroupPositions = () => useSelector(selectGroupPositions, shallowEqual)
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