import {RequiredEventData, RequiredGroupData} from "react-timeline"

let date = 0

export type EventData =
    RequiredEventData
    & { label: string, vacation?: boolean, link: string, buffer?: boolean, manipulated?: boolean }
export type GroupData = RequiredGroupData & { label: string }

export const initialData: { events: Record<string, EventData>, groups: Record<string, GroupData> } = {
    events: {
        '1': {
            interval: {start: date, end: date.valueOf() + 100 * 3600000},
            label: 'IT 18.128',
            groupId: '1',
            vacation: true,
            link: '1',
        },
        '2': {
            interval: {start: date, end: date.valueOf() + 10 * 3600000},
            label: 'IT 18.128',
            groupId: '1',
            link: '2',
        },
        '2-': {
            interval: {start: date.valueOf() + 10 * 3600000, end: date.valueOf() + 10 * 7200000},
            label: 'IT 18.128 - Lieferzeit',
            groupId: '1',
            link: '2',
            buffer: true,
        },
        '3': {
            interval: {start: date, end: date.valueOf() + 10 * 3600000},
            label: 'IT 18.129',
            groupId: '1',
            link: '3',
        },
        '4': {
            interval: {start: date, end: date.valueOf() + 10 * 3600000},
            label: 'IT 18.128',
            groupId: '2',
            link: '4',
        },
        '5': {
            interval: {start: date, end: date.valueOf() + 10 * 3600000},
            label: `IT 18.128`,
            groupId: '3',
            link: `5`,
        },
        '6': {
            interval: {start: date, end: date.valueOf() + 10 * 3600000},
            label: `IT 18.128`,
            groupId: '3',
            link: `6`,
        },
        '7': {
            interval: {start: date, end: date.valueOf() + 10 * 3600000},
            label: `IT 18.128`,
            groupId: '3',
            link: `7`,
        },
        '8': {
            interval: {start: date, end: date.valueOf() + 10 * 3600000},
            label: `IT 18.128`,
            groupId: '3',
            link: `8`,
        },
        '9': {
            interval: {start: date, end: date.valueOf() + 10 * 3600000},
            label: `IT 18.128`,
            groupId: '3',
            link: `9`,
        },
        '10': {
            interval: {start: date, end: date.valueOf() + 10 * 3600000},
            label: `IT 18.128`,
            groupId: '3',
            link: `10`,
        },
        '11': {
            interval: {start: date, end: date.valueOf() + 10 * 3600000},
            label: `IT 18.128`,
            groupId: '3',
            link: `11`,
        },
        '12': {
            interval: {start: date, end: date.valueOf() + 10 * 3600000},
            label: `IT 18.128`,
            groupId: '3',
            link: `12`,
        },
        '13': {
            interval: {start: date, end: date.valueOf() + 10 * 3600000},
            label: `IT 18.128`,
            groupId: '3',
            link: `13`,
        },
    },
    groups: {
        '1': {
            label: '1',
        },
        '2': {
            label: `IT 18.128`,
        },
        '3': {
            label: '3',
        },
        '4': {
            label: '4',
        },
        '5': {
            label: '3',
        },
        '6': {
            label: '4',
        },
        '7': {
            label: '3',
        },
        '8': {
            label: '4',
        },
    },

}