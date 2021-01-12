import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
    DayHeader,
    InitialTimelineParameters,
    Timeline,
    TimelineData,
    useTimelineState,
    WeekHeader
} from 'react-timeline'
import 'react-timeline/bundle.css'
import {addDays} from "date-fns"

const App = () => {
    let initialParameters: InitialTimelineParameters = {
        startDate: new Date(),
        endDate: addDays(new Date(), 10)
    }

    let initialData: TimelineData = {
        events: {
            1: {interval: {start: new Date(), end: new Date().valueOf() + 10 * 3600000}, label: 'IT 18.128', group: "1"}
        },
        groups: [
            "1", "2"
        ]

    }
    let [state, setState] = useTimelineState({startDate: new Date(), timePerPixel: 0.02, data: initialData})
    let {data} = state

    return <Timeline state={state} setState={setState} initialParameters={initialParameters}
                     style={{height: '300px', width: '1200px'}} data={data} animate={true}>
        <g>
            <WeekHeader timeZone={"Europe/Berlin"} weekStartsOn={1}/>
        </g>
        <g transform={"translate(0 20)"}>
            <DayHeader timeZone={"Europe/Berlin"}/>
        </g>
    </Timeline>
}

ReactDOM.render(<App/>, document.getElementById('root'))
