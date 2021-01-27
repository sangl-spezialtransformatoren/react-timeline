import React from "react"
import {GroupPresentationalProps} from "../group"

export const DefaultGroupBackground: React.FC<GroupPresentationalProps> = (
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