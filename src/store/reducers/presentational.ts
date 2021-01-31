import {PartialTimelineReducer} from '../index'
import {
    CLOSE_DRAWER,
    DRAG_CANVAS,
    OPEN_DRAWER,
    SET_CONTENT_HEIGHT,
    SET_HEADER_HEIGHT,
    SET_SCROLL_OFFSET,
    SET_SIZE,
} from '../actions'


export let presentational: PartialTimelineReducer<'presentational'> = () => (state, action) => {
    let newState = state?.presentational || {
        headerHeight: 0,
        scrollOffset: 0,
        contentHeight: 0,
        drawerOpening: 0,
        drawerWidth: 80,
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
            let newDrawerOpening = newState.drawerOpening
            if (action.payload.dragDrawer) {
                newDrawerOpening = newDrawerOpening + action.payload.x
                if (newDrawerOpening > newState.drawerWidth) {
                    newDrawerOpening = newState.drawerWidth
                }
                if (newDrawerOpening < 0) {
                    newDrawerOpening = 0
                }
            }

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
                drawerOpening: newDrawerOpening,
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
                    drawerOpening: newState.drawerWidth,
                }
            }
            break
        }
        case OPEN_DRAWER: {
            newState = {
                ...newState,
                drawerOpening: newState.drawerWidth,
            }
            break
        }
        case CLOSE_DRAWER: {
            if (state?.size.width && state.size.width < 960) {
                newState = {
                    ...newState,
                    drawerOpening: 0,
                }
            }
            break
        }
    }
    return newState
}
