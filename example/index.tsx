import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {Grid, InitialTimelineParameters, Timeline} from "react-timeline"
import "react-timeline/bundle.css"
import {useTimelineState} from "../src"

const App = () => {
    let initialParameters: InitialTimelineParameters = {
        startDate: new Date().valueOf(),
        endDate: new Date().valueOf() + 3600000
    }
    let [state, setState] = useTimelineState()
    return <Timeline state={state} setState={setState} initialParamaters={initialParameters} style={{height: 500}}>
        <Grid interval={3600000} startDate={new Date()}/>
    </Timeline>
}

ReactDOM.render(<App/>, document.getElementById('root'))
