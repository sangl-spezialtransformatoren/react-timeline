import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
    MonthHeader,
    DayHeader,
    InitialTimelineParameters,
    Timeline,
    TimelineData,
    useTimelineState,
    WeekHeader
} from 'react-timeline'
import 'react-timeline/bundle.css'
import {addHours} from "date-fns"

const App = () => {
    let initialParameters: InitialTimelineParameters = {
        startDate: new Date(),
        endDate: addHours(new Date(), 1)
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
                     style={{height: '300px', width: '100%'}} data={data} animate={true}>
        <g>
            <MonthHeader timeZone={"Europe/Berlin"} weekStartsOn={1}/>
        </g>
        <g transform={"translate(0 20)"}>
            <WeekHeader timeZone={"Europe/Berlin"} color={"red"}/>
        </g>
        <g transform={"translate(0 40)"}>
            <DayHeader timeZone={"Europe/Berlin"} color={"red"}/>
        </g>
    </Timeline>
}

ReactDOM.render(<App/>, document.getElementById('root'))
