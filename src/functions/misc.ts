import {format as dateFnsTzFormat, utcToZonedTime} from 'date-fns-tz'


export function format(date: Date | number, formatString: string, {timeZone}: {timeZone: string}) {
    return dateFnsTzFormat(utcToZonedTime(new Date(date), timeZone), formatString, {timeZone})
}


export function boundingBoxRelativeToSVGRoot(fromSpace: SVGGeometryElement, toSpace: SVGGeometryElement | SVGSVGElement, svgRoot: SVGSVGElement) {
    let bbox = fromSpace.getBBox()

    let ctm1 = toSpace.getScreenCTM()
    let ctm2 = fromSpace.getScreenCTM()
    if (ctm1 && ctm2) {
        let m = ctm1.inverse().multiply(ctm2)

        let topLeftCorner = svgRoot.createSVGPoint()
        topLeftCorner.x = bbox.x
        topLeftCorner.y = bbox.y

        let bottomRightCorner = svgRoot.createSVGPoint()
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

let bodyScrollDisabled: boolean = false
let formerOnDocumentTouchMove: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null | undefined = () => true

export function deactivateBodyScroll(document: Document) {
    if (!bodyScrollDisabled) {
        bodyScrollDisabled = true
        formerOnDocumentTouchMove = document.ontouchmove?.bind(undefined)
        document.ontouchmove = function(e) {
            e.preventDefault()
        }
    }
}

export function activateBodyScroll(document: Document) {
    if (bodyScrollDisabled) {
        bodyScrollDisabled = false
        if (formerOnDocumentTouchMove) {
            document.ontouchmove = formerOnDocumentTouchMove.bind(document)
        } else {
            document.ontouchmove = () => true
        }
    }
}
