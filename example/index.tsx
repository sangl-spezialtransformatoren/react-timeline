import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
    AutomaticGrid,
    AutomaticHeader,
    DefaultBusinessLogic,
    Events,
    GroupBackgrounds,
    GroupLabels,
    Now,
    Timeline,
} from 'react-timeline'
import 'react-timeline/bundle.css'
import {addDays} from 'date-fns'
import {initialData} from './components/data'


const App = () => {
    let timelineProps = {
        events: initialData.events,
        groups: initialData.groups,
        initialStartDate: 0,
        initialEndDate: addDays(0, 28).valueOf(),
        style: {height: '100%', width: '100%'},
        businessLogic: DefaultBusinessLogic,
        timeZone: 'Etc/UTC',
    }

    return <Timeline {...timelineProps}>
        <AutomaticGrid />
        <AutomaticHeader />
        <Events />
        <GroupBackgrounds />
        <GroupLabels />
        <Now />
    </Timeline>
}

ReactDOM.render(<App />, document.getElementById('root'))
