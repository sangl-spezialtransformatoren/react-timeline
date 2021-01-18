import {useSelector} from "./index"
import {shallowEqual} from "react-redux"
import {IntervalCreator} from "../functions"
import {
    getGroupHeights,
    getGroupIdsFromEvents,
    getGroupPositions,
    getGroupsAndEvents,
    getHeaderIntervals,
    getPositionsInGroup,
    selectAnimate,
    selectDateZero,
    selectEndDate,
    selectEvents,
    selectInitialized,
    selectInterval,
    selectSize,
    selectSpringConfig,
    selectStartDate,
    selectTimePerPixel,
    selectTimeZone,
    selectWeekStartsOn,
    selectZoomCenter
} from "./selectors"


export const useAnimate = () => useSelector(selectAnimate)
export const useEvents = () => useSelector(selectEvents)
export const useGetInterval = (id: string) => useSelector(selectInterval(id), shallowEqual)
export const useGroupPositions = () => useSelector(getGroupPositions, shallowEqual)
export const useGetGroupHeights = () => useSelector(getGroupHeights, shallowEqual)
export const useGetGroupsFromEvents = () => useSelector(getGroupIdsFromEvents, shallowEqual)
export const useGetGroupsAndEvents = () => useSelector(getGroupsAndEvents, shallowEqual)
export const useGetHeaderIntervals = (intervalCreator: IntervalCreator, intervalLength: number) => useSelector(getHeaderIntervals(intervalCreator, intervalLength), shallowEqual)
export const useGetPositionsInGroup = (groupId: string) => useSelector(getPositionsInGroup(groupId), shallowEqual)
export const useInitialized = () => useSelector(selectInitialized)
export const useSize = () => useSelector(selectSize)
export const useSpringConfig = () => useSelector(selectSpringConfig)
export const useStartDate = () => useSelector(selectStartDate)
export const useDateZero = () => useSelector(selectDateZero)
export const useTimePerPixel = () => useSelector(selectTimePerPixel)
export const useEndDate = () => useSelector(selectEndDate)
export const useZoomCenter = () => useSelector(selectZoomCenter)
export const useTimeZone = () => useSelector(selectTimeZone)
export const useWeekStartsOn = () => useSelector(selectWeekStartsOn)