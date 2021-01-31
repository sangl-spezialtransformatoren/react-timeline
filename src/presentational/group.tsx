import React from "react"
import {GroupBackgroundPresentationalProps, GroupLabelPresentationalProps} from "../group"


export const DefaultGroupBackground: React.FC<GroupBackgroundPresentationalProps> = (
    {
        width,
        y,
        height,
        groupIndex,
        numberOfGroups
    }) => {
    return <>
        <rect x={0}
              width={width}
              y={y}
              height={height}
              fill={groupIndex % 2 === numberOfGroups % 2 ? 'rgba(0,0,0,0.05)' : 'transparent'}
              stroke={'transparent'}
        />
    </>
}

export const DefaultGroupLabel: React.FC<GroupLabelPresentationalProps> = (
    {
        y,
        height,
    }) => {
    return <>
        <circle cx={30} cy={y + height / 2} r={20} fill={"rgba(110,110,110,0.9)"}/>
        <text alignmentBaseline="central" fontFamily={"sans-serif"} textAnchor="middle" x={30} y={y + height / 2}
              fill={"white"}>WS
        </text>
    </>
}