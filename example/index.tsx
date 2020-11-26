import 'react-app-polyfill/ie11'
import * as React from 'react'
import {useState} from 'react'
import * as ReactDOM from 'react-dom'
import {AdaptiveGrid, DivBar, Timeline} from "react-timeline"
import {TimelineState} from "../src/timeline"


const App = () => {
    let [state, setState] = useState<TimelineState>({
        startDate: new Date(),
        endDate: (new Date()).valueOf() + 3600000
    })

    return (
        <Timeline state={state} setState={setState}>
            <AdaptiveGrid strokeWidth={1} stroke={"gray"}/>
            <DivBar interval={{start: new Date().valueOf() - 3600000, end: new Date().valueOf() + 4 * 240000}}
                    label={"Test"} y={20}
                    height={30} style={{border: "1px solid black"}}/>
        </Timeline>
    )
}

ReactDOM.render(<App/>, document.getElementById('root'))
