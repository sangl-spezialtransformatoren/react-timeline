import React, {useMemo} from "react"

export const Donut: React.FC = () => {
    let parts = useMemo(() => [0.0, 0.1, 0.4, 0.5, 0.6, 0, 7, 1.0], [])
    let pairs = useMemo(() => parts.slice(0, -1).map(function (e, i) {
        return [e, parts.slice(1)[i]]
    }), [parts])
    let r = 5
    let c = [500, 490]
    let colors = ["#777777", "#FFD400", "#FBA047", "#F5687E", "#AF6DDA", "#7391E0", "#22a428", "#0F6712"]
    return <g>
        {pairs.map(([start, end], i) => {
            return <path
                key={i}
                d={`M ${c[0] + r * Math.cos(2 * Math.PI * start)} ${c[1] + r * Math.sin(2 * Math.PI * start)} A ${r} ${r} 1 0 1 ${c[0] + r * Math.cos(2 * Math.PI * end)} ${c[1] + r * Math.sin(2 * Math.PI * end)} `}
                fill={"none"}
                stroke={colors[i+2]}
                strokeWidth={5}
                strokeLinecap={"butt"}
            />
        })
        }
    </g>
}