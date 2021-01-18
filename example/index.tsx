import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {AutomaticHeader, InitialTimelineParameters, Timeline} from 'react-timeline'
import 'react-timeline/bundle.css'
import {addDays} from 'date-fns'

const App = () => {
    let initialParameters: InitialTimelineParameters = {
        startDate: new Date(),
        endDate: addDays(new Date(), 28),
    }

    let initialData = {
        events: {
            1: {
                interval: {start: new Date(), end: new Date().valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                group: '1',
            },
            2: {
                interval: {start: new Date(), end: new Date().valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                group: '1',
            },
            3: {
                interval: {start: new Date(), end: new Date().valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                group: '2',
            },
            4: {
                interval: {start: new Date(), end: new Date().valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                group: '2',
            },
            5: {
                interval: {start: new Date(), end: new Date().valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                group: '3',
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
        style={{height: '500px', width: '100%'}}
        timeZone={'Europe/Berlin'}
        animate={true}
        springConfig={{mass: 0.8, tension: 210, friction: 20}}
    >
        <AutomaticHeader/>
    </Timeline>
}

ReactDOM.render(<App/>, document.getElementById('root'))
