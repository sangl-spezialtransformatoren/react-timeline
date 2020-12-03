import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Grid, InitialTimelineParameters, Timeline, TimelineData, useTimelineState } from 'react-timeline'
import 'react-timeline/bundle.css'

const App = () => {
  let initialParameters: InitialTimelineParameters = {
    startDate: 0,
    endDate: 50
  }

  let data: TimelineData = {
    events: {
      1: { interval: { start: 0, end: 10 }, label: 'Test' },
      2: { interval: { start: 1, end: 2 }, label: 'Test' },
      3: { interval: { start: 3, end: 4 }, label: 'Test'},
      4: { interval: { start: 5, end: 11 }, label: 'Test' },
      5: { interval: { start: 6, end: 11 }, label: 'Test' },
    }
  }
  let [state, setState] = useTimelineState({startDate: 0, timePerPixel: 0.02, data })
  return <Timeline state={state} setState={setState} initialParameters={initialParameters}
                   style={{ height: '300px', width: '100%' }} data={data}>
    <Grid interval={3600000} startDate={new Date()} />
  </Timeline>
}

ReactDOM.render(<App />, document.getElementById('root'))
