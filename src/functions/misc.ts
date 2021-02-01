import {format as dateFnsTzFormat, utcToZonedTime} from 'date-fns-tz'


export function format(date: Date | number, formatString: string, {timeZone}: { timeZone: string }) {
    return dateFnsTzFormat(utcToZonedTime(new Date(date), timeZone), formatString, {timeZone})
}


export function boundingBoxRelativeToSVGRoot(fromSpace: SVGGeometryElement, toSpace: SVGGeometryElement | SVGSVGElement, svgRoot: SVGSVGElement) {
    let bbox = fromSpace.getBBox()

    let ctm1 = toSpace.getScreenCTM()
    let ctm2 = fromSpace.getScreenCTM()
    if (ctm1 && ctm2) {
        var m = ctm1.inverse().multiply(ctm2)

        var topLeftCorner = svgRoot.createSVGPoint()
        topLeftCorner.x = bbox.x
        topLeftCorner.y = bbox.y

        var bottomRightCorner = svgRoot.createSVGPoint()
        bottomRightCorner.x = bbox.x + bbox.width
        bottomRightCorner.y = bbox.y + bbox.height

        topLeftCorner = topLeftCorner.matrixTransform(m)
        bottomRightCorner = bottomRightCorner.matrixTransform(m)

        return {
            x: topLeftCorner.x,
            y: topLeftCorner.y,
            width: Math.abs(bottomRightCorner.x - topLeftCorner.x),
            height: Math.abs(bottomRightCorner.y - topLeftCorner.y),
        }
    } else {
        return {
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height,
        }
    }
}
