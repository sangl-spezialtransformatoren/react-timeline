import 'react-app-polyfill/ie11'
import * as React from 'react'
import {useEffect} from 'react'
import * as ReactDOM from 'react-dom'
import {Grid, InitialTimelineParameters, Timeline, TimelineData, useTimelineState} from 'react-timeline'
import 'react-timeline/bundle.css'

const App = () => {
    let initialParameters: InitialTimelineParameters = {
        startDate: 0,
        endDate: 50
    }

    let initialData: TimelineData = {
        events: {
            1: {interval: {start: 0, end: 10}, label: 'Test', group: 1},
            2: {interval: {start: 1, end: 2}, label: 'Test', group: 2},
            3: {interval: {start: -10, end: -3}, label: 'Test'},
            4: {interval: {start: 5, end: 11}, label: 'Test'},
            5: {interval: {start: 6, end: 11}, label: 'Test'},
        },
        groups: [
            1, 2
        ]

    }
    let [state, setState] = useTimelineState({startDate: 0, timePerPixel: 0.02, data: initialData})
    let {data} = state

    useEffect(() => {
        console.log(data)
    }, [data])

    return <Timeline state={state} setState={setState} initialParameters={initialParameters}
                     style={{height: '300px', width: '100%'}} data={data}>
        <Grid interval={3600000} startDate={new Date()}/>
    </Timeline>
}

ReactDOM.render(<App/>, document.getElementById('root'))
