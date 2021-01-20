import 'react-app-polyfill/ie11'
import * as React from 'react'
import {useEffect, useState} from 'react'
import * as ReactDOM from 'react-dom'
import {AutomaticHeader, InitialTimelineParameters, Timeline} from 'react-timeline'
import 'react-timeline/bundle.css'
import {addDays} from 'date-fns'

const App = () => {
    let date = 0
    let initialParameters: InitialTimelineParameters = {
        startDate: date,
        endDate: addDays(date, 28).valueOf(),
    }

    let [x, setX] = useState(0)
    console.log(x)

    useEffect(() => {
        setInterval(() => setX(x => x + 1), 2000)
    }, [])

    let initialData = {
        events: {
            1: {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                groupId: '1',
            },
            2: {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                groupId: '1',
            },
            3: {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                groupId: '2',
            },
            4: {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                groupId: '2',
            },
            5: {
                interval: {start: date, end: date.valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                groupId: '3',
            },
        },
        groups: {
            '1': {
                name: '1',
            },
            '2': {
                name: '2',
            },
        },

    }

    return <Timeline
        initialData={initialData}
        initialParameters={initialParameters}
        style={{height: '100%', width: '100%'}}
        timeZone={'Europe/Berlin'}
        animate={true}
        springConfig={{mass: 0.8, tension: 210, friction: 20}}
    >
        <AutomaticHeader />
    </Timeline>
}

ReactDOM.render(<App />, document.getElementById('root'))
