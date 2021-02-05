import {useSelector} from './index'
import {shallowEqual} from 'react-redux'
import {IntervalCreator} from '../functions/intervals'
import {
    getGroupOffsets,
    getHeaderIntervals,
    selectAnimate,
    selectContentHeight,
    selectDateZero,
    selectDrawerOpened,
    selectDrawerWidth,
    selectEventHeight,
    selectEventIdsOrderedForPainting,
    selectEventIdToGroupIdMap,
    selectEventIntervals,
    selectEventMargin,
    selectEventPositionsInGroup,
    selectEventYs,
    selectGroupEventHeights,
    selectGroupHeights,
    selectGroupIds,
    selectGroupIndices,
    selectGroupPadding,
    selectGroupYs,
    selectHeaderHeight,
    selectInitialized,
    selectMapEventIdToProps,
    selectMapEventIdToSelected,
    selectMapGroupIdToProps,
    selectMinGroupHeight,
    selectNumberOfGroups,
    selectScrollOffset,
    selectSize,
    selectSpringConfig,
    selectStartDate,
    selectTimePerPixel,
    selectTimeZone,
} from './selectors'


export const useAnimate = () => useSelector(selectAnimate)
export const useGroupOffsets = () => useSelector(getGroupOffsets)
export const useEventIdsOrderedForPainting = () => useSelector(selectEventIdsOrderedForPainting)
export const useEventAndGroupIds = () => useSelector(selectEventIdToGroupIdMap)
export const useGroupEventHeights = () => useSelector(selectGroupEventHeights)
export const useGroupIndices = () => useSelector(selectGroupIndices)
export const useGetHeaderIntervals = (intervalCreator: IntervalCreator, intervalLength: number) => useSelector(getHeaderIntervals(intervalCreator, intervalLength))
export const useEventPositionsInGroup = () => useSelector(selectEventPositionsInGroup)
export const useInitialized = () => useSelector(selectInitialized)
export const useSize = () => useSelector(selectSize)
export const useSpringConfig = () => useSelector(selectSpringConfig)
export const useStartDate = () => useSelector(selectStartDate)
export const useDateZero = () => useSelector(selectDateZero)
export const useTimePerPixel = () => useSelector(selectTimePerPixel)
export const useTimeZone = () => useSelector(selectTimeZone)
export const useMapEventIdToProps = () => useSelector(selectMapEventIdToProps)
export const useGroupIds = () => useSelector(selectGroupIds, shallowEqual)
export const useHeaderHeight = () => useSelector(selectHeaderHeight)
export const useNumberOfGroups = () => useSelector(selectNumberOfGroups)
export const useScrollOffset = () => useSelector(selectScrollOffset)
export const useContentHeight = () => useSelector(selectContentHeight)
export const useDrawerOpened = () => useSelector(selectDrawerOpened)
export const useDrawerWidth = () => useSelector(selectDrawerWidth)
export const useMapGroupIdToProps = () => useSelector(selectMapGroupIdToProps)
export const useEventHeight = () => useSelector(selectEventHeight)
export const useEventMargin = () => useSelector(selectEventMargin)
export const useGroupPadding = () => useSelector(selectGroupPadding)
export const useMinGroupHeight = () => useSelector(selectMinGroupHeight)
export const useGroupHeights = () => useSelector(selectGroupHeights)
export const useGroupYs = () => useSelector(selectGroupYs)
export const useEventYs = () => useSelector(selectEventYs)
export const useEventIntervals = () => useSelector(selectEventIntervals)
export const useMapEventIdToSelected = () => useSelector(selectMapEventIdToSelected)