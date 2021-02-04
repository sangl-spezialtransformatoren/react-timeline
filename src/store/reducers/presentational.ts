import {PartialTimelineReducer} from '../index'
import {
    CLOSE_DRAWER,
    DRAG_CANVAS,
    OPEN_DRAWER,
    SET_CONTENT_HEIGHT,
    SET_DRAWER_WIDTH,
    SET_HEADER_HEIGHT,
    SET_LAYOUT_PARAMETERS,
    SET_SCROLL_OFFSET,
    SET_SIZE,
} from '../actions'


export let presentational: PartialTimelineReducer<'presentational'> = () => (state, action) => {
    let newState = state?.presentational || {
        headerHeight: 0,
        scrollOffset: 0,
        contentHeight: 0,
        drawerWidth: 80,
        drawerOpened: true,
        eventHeight: 25,
        eventSpacing: 8,
        groupPadding: 30,
        minGroupHeight: 45,
    }
    switch (action.type) {
        case SET_HEADER_HEIGHT: {
            newState = {
                ...newState,
                headerHeight: action.payload,
            }
            break
        }
        case DRAG_CANVAS: {
            let newScrollOffset = newState.scrollOffset + action.payload.y
            if (action.payload.applyBounds) {
                let headerHeight = newState.headerHeight
                let divHeight = state?.size.height || 0
                let contentHeight = newState.contentHeight
                newScrollOffset = Math.min(newScrollOffset, 0)
                newScrollOffset = Math.max(newScrollOffset, -Math.max(headerHeight + contentHeight - divHeight, 0))
            }

            newState = {
                ...newState,
                scrollOffset: newScrollOffset,
            }
            break
        }
        case SET_SCROLL_OFFSET: {
            newState = {
                ...newState,
                scrollOffset: action.payload,
            }
            break
        }
        case SET_CONTENT_HEIGHT: {
            newState = {
                ...newState,
                contentHeight: action.payload,
            }
            break
        }
        case SET_SIZE: {
            if (action.payload.width > 960) {
                newState = {
                    ...newState,
                    drawerOpened: true,
                }
            }
            if (state?.size.height) {
                let dy = action.payload.height - state.size.height
                if (dy > 0) {
                    newState = {
                        ...newState,
                        scrollOffset: Math.min(newState.scrollOffset + dy, 0),
                    }
                }
            }
            break
        }
        case OPEN_DRAWER: {
            newState = {
                ...newState,
                drawerOpened: true,
            }
            break
        }
        case CLOSE_DRAWER: {
            if (state?.size.width && state.size.width < 960) {
                newState = {
                    ...newState,
                    drawerOpened: false,
                }
            }
            break
        }
        case SET_LAYOUT_PARAMETERS: {
            newState = {
                ...newState,
                eventHeight: action.payload.eventHeight || newState.eventHeight,
                eventSpacing: action.payload.eventSpacing || newState.eventSpacing,
                groupPadding: action.payload.groupPadding || newState.groupPadding,
                minGroupHeight: action.payload.minGroupHeight || newState.minGroupHeight,
            }
            break
        }
        case SET_DRAWER_WIDTH: {
            newState = {
                ...newState,
                drawerWidth: action.payload,
            }
            break
        }
    }
    return newState
}
