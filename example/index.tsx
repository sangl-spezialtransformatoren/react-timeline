import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
    AutomaticHeader,
    createTimelineStore,
    InitialTimelineParameters,
    Timeline,
    TimelineData,
    useTimelineState
} from 'react-timeline'
import 'react-timeline/bundle.css'
import {addDays} from "date-fns"

const App = () => {
    let initialParameters: InitialTimelineParameters = {
        startDate: new Date(),
        endDate: addDays(new Date(), 28)
    }

    let initialData: TimelineData = {
        events: {
            1: {
                interval: {start: new Date(), end: new Date().valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                group: "1"
            },
            2: {
                interval: {start: new Date(), end: new Date().valueOf() + 10 * 3600000},
                label: 'IT 18.128',
                group: "1"
            },
            3: {interval: {start: new Date(), end: new Date().valueOf() + 10 * 3600000}, label: 'IT 18.128', group: "1"}
        },
        groups: [
            "1", "2"
        ]

    }
    let [state, setState] = useTimelineState({startDate: new Date(), timePerPixel: 0.02, data: initialData})

    let {data} = state


    return <Timeline
                     setState={setState}
                     state={state}
                     initialParameters={initialParameters}
                     style={{height: '500px', width: '100%'}} data={data} animate={true}
                     timeZone={"Europe/Berlin"}
                     weekStartsOn={1}>
        <AutomaticHeader/>
    </Timeline>
}

ReactDOM.render(<App/>, document.getElementById('root'))
