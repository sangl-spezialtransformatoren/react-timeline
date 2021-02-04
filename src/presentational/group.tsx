import React from 'react'
import {GroupBackgroundPresentationalProps} from '../components/groupBackground'
import {GroupLabelBackgroundPresentationalProps, GroupLabelPresentationalProps} from '../components/groupLabel'


export const DefaultGroupBackground: React.FC<GroupBackgroundPresentationalProps> = (
    {
        width,
        y,
        height,
        groupIndex,
        numberOfGroups,
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
        <circle cx={30} cy={y + height / 2} r={20} fill={'rgba(110,110,110,0.9)'} />
        <text alignmentBaseline="central" fontFamily={'sans-serif'} textAnchor="middle" x={30} y={y + height / 2}
              fill={'white'}>
        </text>
    </>
}

export const DefaultGroupLabelBackground: React.FC<GroupLabelBackgroundPresentationalProps> = (
    {
        y,
        height,
    }) => {
    return <>
        <rect x={0} y={y} width={60} height={height} fill={'rgba(250,250,250,1)'} />
        <rect x={60} width={1} y={y} height={height} fill={'lightgray'} />
    </>
}